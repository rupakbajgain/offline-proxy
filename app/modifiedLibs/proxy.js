'use strict';

const Proxy = require('http-mitm-proxy');

module.exports = function(){
  var proxy = Proxy();

  // Update on error handler of proxy, don't write response
  proxy._onError = function(kind, ctx, err) {
    this.onErrorHandlers.forEach(function(handler) {
      return handler(ctx, err, kind);
    });
    if (ctx) {
      ctx.onErrorHandlers.forEach(function(handler) {
        return handler(ctx, err, kind);
      });
    }
  };

  return proxy;
};
