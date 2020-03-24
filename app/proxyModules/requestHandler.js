'use strict';

const mime = require('mime-types');
const fs = require('fs');
const path = require('path');

const config = require('../config/config');
const random = require('../utils/random');
const getDB = require('../helperClass/getDatabase');

module.exports = {
  onRequest: function(ctx, callback) {
    var host = ctx.clientToProxyRequest.headers.host;
    var url = ctx.clientToProxyRequest.url;
    var ulink = host + url;// -----

    if (config.options.apponline === 'true'){
      // Online so add callbacks to save webpage
      ctx.onResponse(function(ctx, callback){
        var contentType = ctx.serverToProxyResponse.headers['content-type'];
        var extension = mime.extension(contentType);
        var filename = random.randomFileName(extension);
        var relpath = config.options.offlineFilesDir + filename;
        // Changing to absolute
        filename = path.resolve(process.cwd(), relpath);

        var file = fs.createWriteStream(filename);
        ctx.file = file; // Need to fix later

        var dao = getDB.getDatabase(host);
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
      // Other callbacks have been added so add callback
      return callback();
    } else {
      // Offline so try to access from db
      var dao = getDB.getDatabase(host);
      dao.filenameTable.getFilename(url)
        .then((a) => {
          if (a.length){
            var randomFile = Math.floor(Math.random() * a.length);
            var filename = a[randomFile].file; // Send one file randomly
            console.log('Sending saved file:' + ulink);
            ctx.clientToProxyRequest.fileToSend = filename;
          };
          // Send file back
          var app = config.getVirtualApp('control-panel.offline');
          app.handle(ctx.clientToProxyRequest, ctx.proxyToClientResponse);
        });
      return; // Handled so stop further steps
    }
  },
};
