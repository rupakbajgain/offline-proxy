'use strict';

// Mostly contains constants
var config = {
  URL: 'http://127.0.0.1',
  PORT: process.env.PORT || 8080,
  options: {
    apponline: 'false',
    offlineFilesDir: './.file/',
  },
  getProxyUrl: function(){
    return this.URL + ':' + this.PORT;
  },
};

module.exports = {
  requires: ['PHASE_10'],
  gives: ['global:config'],
  init: () => {
    global.config = config;
  },
};
