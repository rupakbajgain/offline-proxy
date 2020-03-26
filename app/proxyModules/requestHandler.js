'use strict';

const mime = require('mime-types');
const fs = require('fs');
const path = require('path');
const liburl = require('url');

const debugCookie = require('debug')('proxyapp:cookie');
const debug = require('debug')('proxyapp:requesthandler');

const config = require('../config/config');
const random = require('../utils/random');
const getDB = require('../helperClass/getDatabase');

// Add features to config
config.virtualHosts = {};
config.getVirtualApp = function(weblink){
  return config.virtualHosts[weblink];// Direct subtitution for now
};
config.setVirtualApp = function(weblink, app){
  if (!config.getVirtualApp(weblink)){
    config.virtualHosts[weblink] = app;
  }
};

// Default is offline mode,
// Which automatically connects to net if given file is unavailable

module.exports = {
  onRequest: async function(ctx, callback) {
    var host = ctx.clientToProxyRequest.headers.host;
    var url = ctx.clientToProxyRequest.url;
    var ulink = host + url;// -----

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

    // Check for virtual apps
    var vapp = config.getVirtualApp(host);
    if (vapp){
      // If exists than diapatch
      debug('Sending to virtual host: ' + host);
      vapp.handle(ctx.clientToProxyRequest, ctx.proxyToClientResponse);
      return;
    };

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

      // If returned from resource directly
      if (ctx.clientToProxyRequest.fileToSend)
        return;
    }

    // Now try fetching from net
    ctx.onResponse(function(ctx, callback){
      debug('Feteching ' + ulink);
      // Save file for get methods only
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
      if (ctx.file)
        ctx.file.close();
      return callback(null);
    });

    // Other callbacks have been added so call callback
    return callback();

    // Leave other things to error handler
  },
};
