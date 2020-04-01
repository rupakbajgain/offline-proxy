'use strict';

const Proxy = require('http-mitm-proxy');

var ProxyMOD = function(){
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


module.exports = {
  requires: ['PHASE_10'],
  gives: ['global:proxy'],
  init: () => {
    global.proxy = ProxyMOD();
  },
};
