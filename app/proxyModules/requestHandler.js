'use strict';

console.log(global);
const chalk = require('chalk');
const mime = require('mime-types');
const fs = require('fs');
const path = require('path');
const liburl = require('url');

const debugCookie = require('debug')('proxyapp:cookie');
const debug = require('debug')('proxyapp:requesthandler');

const random = require('../utils/random');
const getDB = require('../helperClass/getDatabase');
const { FCacher } = require('../middlewareHelper/funcCacher');
const types = require('../types');
const config = global.config;
const store = global.store;
const actionCreators = global.actionCreators;

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

// -----------------------------------------------------------------
var _version;
var _applicationState;
// Active listener for global states
store.subscribe((s) => {
  var state = store.getState();
  _applicationState = state.appStatus.appMode;
  _version = state.plugin.version;
});
// ------------------------------------------------------------------

var action;
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
action = actionCreators.registerRequestHandler(
  types.DEFAULT_APP,
  () => disabledSites,
);
store.dispatch(action);

// Show log
// can run parallel
var linkLogger = (ctx, next) => {
  var host = ctx.clientToProxyRequest.headers.host;
  var url = ctx.clientToProxyRequest.url;
  var ulink = host + url;
  console.log(chalk.green('>'), chalk.greenBright(ulink));
  next();
};
action = actionCreators.registerRequestHandler(
  types.DEFAULT_APP,
  () => linkLogger,
  true,
);
store.dispatch(action);

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
  }
  next();
};
action = actionCreators.registerRequestHandler(
  types.DEFAULT_APP,
  () => cookieAccepter,
  true,
);
store.dispatch(action);

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
  }
  return next();
};
action = actionCreators.registerRequestHandler(
  types.DEFAULT_APP,
  () => vappHandler,
);
store.dispatch(action);

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
        }
      });

    if (ctx.clientToProxyRequest.fileToSend)
      return;

    return next();
  }
};
action = actionCreators.registerRequestHandler(
  types.DEFAULT_APP,
  (mode) => {
    if (mode <= types.SOFFLINE)
      return sendSaved;
  },
);
store.dispatch(action);

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
action = actionCreators.registerRequestHandler(
  types.DEFAULT_APP,
  (mode) => {
    if (mode >= types.SOFFLINE)
      return registerCallbacks;
  },
);
store.dispatch(action);


var asyncLib = require('async');
// Return lambda to dispacher handlers
function _dispachHandler(arg1, mode){
  var plugin = store.getState().plugin;
  var series = plugin.requestSeriesList.map((obj) => {
    return obj.handleProvider(mode);
  }).filter((a) => a);
  var parallel = plugin.requestParallelList.map((obj) => {
    return obj.handleProvider(mode);
  }).filter((a) => a);

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

var _oldVersion = 0;
module.exports = {
  onRequest: async function(ctx, callback) {
    var result;
    if (_oldVersion !== _version){
      _oldVersion = _version;
      result = dispatchHandler.updateCall(
        null,
        _applicationState,
      );
    } else {
      result = dispatchHandler.cacheCall(
        null,
        _applicationState,
      );
    }
    result(ctx, callback);
  },
};
