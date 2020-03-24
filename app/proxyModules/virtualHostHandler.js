'use strict';
// Handle virtual hosts

var config = require('../config/config');

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

module.exports = {
  onRequest: function(ctx, callback) {
    var host = ctx.clientToProxyRequest.headers.host;
    // Check if virtual app exists for given host
    var vapp = config.getVirtualApp(ctx.clientToProxyRequest.headers.host);
    if (vapp){
      // If exists than diapatch
      console.log('Sending ' + host + ' request to virtual host.');
      vapp.handle(ctx.clientToProxyRequest, ctx.proxyToClientResponse);
      return;
    }
    return callback();
  },
};
