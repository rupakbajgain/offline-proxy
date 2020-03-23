'use strict';

var config = {
  URL: 'http://127.0.0.1',
  PORT: process.env.PORT || 8080,
  options: {
    apponline: 'false',
    offlineFilesDir: './.file/',
  }, // Can be modified within program

  getProxyUrl: function(){
    return this.URL + ':' + this.PORT;
  },

  virtualHosts: {},
  getVirtualApp: function(weblink){
    return config.virtualHosts[weblink];// Direct subtitution for now
  },
  setVirtualApp: function(weblink, app){
    if (!config.getVirtualApp(weblink)){
      config.virtualHosts[weblink] = app;
    }
  },
};

module.exports = config;
