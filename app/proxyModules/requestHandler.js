'use strict';

const config = require('../config/config');
const random = require('../utils/random');
const mime = require('mime-types');
const fs = require('fs');
const path = require('path');

module.exports = {
  onRequest: function(ctx, callback) {
    var host = ctx.clientToProxyRequest.headers.host;
    var url = ctx.clientToProxyRequest.url;
    var ulink = host + url;
    console.log('REQUEST: http://' + ulink);
    // Check virtual app
    var vapp = config.getVirtualApp(ctx.clientToProxyRequest.headers.host);
    if (vapp){
      vapp.handle(ctx.clientToProxyRequest, ctx.proxyToClientResponse);
      return;
    }
    if (config.options.apponline === 'true'){
      // Online so save it
      ctx.onResponse(function(ctx, callback){
        var contentType = ctx.serverToProxyResponse.headers['content-type'];
        var extension = mime.extension(contentType);
        var filename = random.randomFileName(extension);
        var relpath = config.options.offlineFilesDir + filename;
        // Changing to absolute
        filename = path.resolve(process.cwd(), relpath);
        var file = fs.createWriteStream(filename);
        ctx.file = file;
        return callback(null);
      });
      ctx.onResponseData(function(ctx, chunk, callback) {
        ctx.file.write(chunk);
        return callback(null, chunk);
      });
      ctx.onResponseEnd(function(ctx, callback) {
        ctx.file.close();
        return callback(null);
      });
      return callback();
    } else {
      var app = config.getVirtualApp('control-panel.offline');
      app.handle(ctx.clientToProxyRequest, ctx.proxyToClientResponse);
    }
  },
};
