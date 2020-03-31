'use strict';

const chalk = require('chalk');
const mime = require('mime-types');
const fs = require('fs');
const path = require('path');
const liburl = require('url');

const debugCookie = require('debug')('proxyapp:cookie');
const debug = require('debug')('proxyapp:requesthandler');

const config = require('../config/config');
const random = require('../utils/random');
const getDB = require('../helperClass/getDatabase');
const { FCacher } = require('../middlewareHelper/funcCacher');
const pProvider = require('../pluginProvider/pProvider')();
const modes = require('../types/modes');

// Add features to config
config.virtualHosts = {};
config.getVirtualApp = function(weblink){
  return config.virtualHosts[weblink];
  // Direct subtitution for now
};
config.setVirtualApp = function(weblink, app){
  if (!config.getVirtualApp(weblink)){
    config.virtualHosts[weblink] = app;
  }
};

// Stops processing for disabled sites
// can't run parallel
var disabledSites = async(ctx, next) => {
  var host = ctx.clientToProxyRequest.headers.host;
  // get site options
  var dao2 = await getDB.getMainDatabase('site');
  var disabledSites = [];
  await dao2.siteSwitchesTable.getAll()
    .then(a => {
      var i;
      for (i in a){
        if (a[i].value === 'disabled')
          disabledSites.push(a[i].site);
      }
    });

  if (disabledSites.includes(host)) {
    debug('disabled site', host);
    return next('DISABLED_SITE');
  }
  return next();
};
pProvider.onRequest(disabledSites);

// Show log
// can run parallel
var linkLogger = (ctx, next) => {
  var host = ctx.clientToProxyRequest.headers.host;
  var url = ctx.clientToProxyRequest.url;
  var ulink = host + url;
  console.log(chalk.green('>'), chalk.greenBright(ulink));
  next();
};
pProvider.onRequest([], linkLogger, true);

// Saves cookie from browser
// can run parallel, no side effect
var cookieAccepter = async(ctx, next) => {
  var host = ctx.clientToProxyRequest.headers.host;
  var dao = await getDB.getDatabase(host.replace(':', '@'));

  // If request has cookie update the saved cookie
  var cookie = ctx.clientToProxyRequest.headers.cookie;
  if (cookie){
    dao.siteTable.getValue('cookie')
      .then((a) => {
        if (a){
          if (a.value !== cookie){
            debugCookie('Updating cookie:' + host);
            dao.siteTable.update('cookie', cookie);
          }
        } else {
          debugCookie('Set cookie:' + host);
          dao.siteTable.create('cookie', cookie);
        }
      });
  };
  next();
};
pProvider.onRequest([], cookieAccepter, true);

// Handle virtual apps
// Series
var vappHandler = (ctx, next) => {
  var host = ctx.clientToProxyRequest.headers.host;

  // Check for virtual apps
  var vapp = config.getVirtualApp(host);
  if (vapp){
    // If exists than diapatch
    debug('Sending to virtual host: ' + host);
    vapp.handle(ctx.clientToProxyRequest, ctx.proxyToClientResponse);
    return;
  };
  return next();
};
pProvider.onRequest(vappHandler);

// Send saved file
var sendSaved = async(ctx, next) => {
  var host = ctx.clientToProxyRequest.headers.host;
  var url = ctx.clientToProxyRequest.url;
  var ulink = host + url;// -----

  var dao = await getDB.getDatabase(host.replace(':', '@'));
  // Now try to send saved file
  if (config.options.apponline === 'false'){
    await dao.filenameTable.getFilename(url)
      .then((a) => {
        if (a.length){
          var randomFile = Math.floor(Math.random() * a.length);
          var filename = a[randomFile].file; // Send one file randomly
          var uinfo = '';
          if (a.length > 1)
            uinfo = '[' + randomFile + ']';
          debug('Sending saved file:' + ulink + uinfo);
          ctx.clientToProxyRequest.fileToSend = filename;
          config.helperApp
            .handle(ctx.clientToProxyRequest, ctx.proxyToClientResponse);
        };
      });

    if (ctx.clientToProxyRequest.fileToSend)
      return;

    return next();
  }
};
pProvider.onRequest([modes.OFFLINE, modes.SOFFLINE], sendSaved);

// Register callbacks
var registerCallbacks = async(ctx, next) => {
  var host = ctx.clientToProxyRequest.headers.host;
  var url = ctx.clientToProxyRequest.url;
  var ulink = host + url;

  var dao = await getDB.getDatabase(host.replace(':', '@'));

  // --- --- ---
  ctx.onResponse(function(ctx, callback){
    debug('Feteching ' + ulink);
    var contentType = ctx.serverToProxyResponse.headers['content-type'];
    if (!contentType) // Try guessing
      contentType = mime.lookup(liburl.parse(url).pathname);
    var extension = mime.extension(contentType);
    var filename = random.randomFileName(extension);
    var relpath = config.options.offlineFilesDir + filename;
    // Changing to absolute
    filename = path.resolve(process.cwd(), relpath);

    var file = fs.createWriteStream(filename);
    ctx.file = file; // Need to fix later
    dao.filenameTable.create(filename, url);
    // Continue processes
    return callback(null);
  });
  // --- --- ----
  ctx.onResponseData(function(ctx, chunk, callback) {
    if (ctx.file)
      ctx.file.write(chunk);
    return callback(null, chunk);
  });
  // --- --- ---
  ctx.onResponseEnd(function(ctx, callback) {
    if (ctx.file){
      dao.requestsTable.deleteUrl(url);
      ctx.file.close();
    }
    return callback(null);
  });
  // --- --- ---
  return next();
};
pProvider.onRequest(
  [
    modes.SOFFLINE,
    modes.SONLINE,
    modes.ONLINE,
  ],
  registerCallbacks);


function _dispachHandler({provider}, mode){
  var [ functorSeries, functorParallel ] = provider.onRequestDispatch();
  var series = functorSeries
    .filter((a) => a.mode.includes(mode))
    .map((a) => a.fn);
  var parallel = functorParallel
    .filter((a) => a.mode.includes(mode))
    .map((a) => a.fn);
  debug([series, parallel]);
  // Compile series code for parallel execution
  // All functions are like middleware
  var seriesFunction = (ctx, next) => {
    asyncLib.series(
      series.map((fn) => {
        return (callback) => {
          fn(ctx, callback);
        };
      })
      ,
      (err) => {
        if (err)
          debug('Middleware result:', err);
        next();
      },
    );
  };
  // Return parallel dispacher function
  return (ctx, callback) => {
    asyncLib.parallel(
      [seriesFunction].concat(parallel).map((fn) => {
        return (callback) => {
          fn(ctx, callback);
        };
      })
      ,
      (err) => {
        if (err)
          debug('Middleware result:', err);
        callback();
      },
    );
  };
}

var dispatchHandler = new FCacher(_dispachHandler);

var asyncLib = require('async');
module.exports = {
  onRequest: async function(ctx, callback) {
    var appmode = (config.options.apponline === 'false') ?
      modes.SOFFLINE : modes.ONLINE;
    var result = dispatchHandler.call({provider: pProvider}, appmode);
    result(ctx, callback);
    // It ends within parallel loop
  },
};
