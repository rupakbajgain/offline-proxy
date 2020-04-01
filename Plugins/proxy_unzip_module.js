'use strict';

// Modified from gunzip
const zlib = require('zlib');

const mod = {
  onResponse: function(ctx, callback) {
    if (ctx.serverToProxyResponse.headers['content-encoding']) {
      switch (ctx.serverToProxyResponse.headers['content-encoding']) {
        case 'br':
          ctx.addResponseFilter(zlib.createBrotliDecompress());
          break;
        case 'gzip':
          ctx.addResponseFilter(zlib.createGunzip());
          break;
        case 'deflate':
          ctx.addResponseFilter(zlib.createInflate());
          break;
        default:
          break;
      }
      delete ctx.serverToProxyResponse.headers['content-encoding'];
    }
    return callback();
  },
  onRequest: function(ctx, callback) {
    var reqOptions = ctx.proxyToServerRequestOptions;
    // Send encoding that server supports if not present
    if (!reqOptions.headers['accept-encoding']){
      var serverEncoding = 'gzip, deflate, br';
      reqOptions.headers['accept-encoding'] = serverEncoding;
    }
    return callback();
  },
};

module.exports = {
  requires: ['global:proxy'],
  gives: ['proxy-module.1'],
  init: () => {
    global.proxy.use(mod);
  },
};
