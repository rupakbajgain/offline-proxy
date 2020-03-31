'use strict';

const debug = require('debug')('proxyapp:pProvider');
const modes = require('../types/modes');

module.exports = function() {
  return new PProvider();
};

class PProvider {
  constructor() {
    this.onRequestSeries = [];
    this.onRequestParallel = [];
  }

  onRequest(){
    var mode = [];
    var fn;
    var parallel = false;
    switch (arguments.length){
      case 1:
        // Only function
        // Run series on all modes
        if (typeof (arguments[0]) === 'function'){
          fn = arguments[0];
        } else {
          debug('Invalid argument:', arguments);
        }
        break;
      case 2:
        // Mode & fn
        if (
          typeof (arguments[0]) === 'object' &&
          typeof (arguments[1] === 'function')
        ){
          mode = arguments[0];
          fn = arguments[1];
        } else {
          debug('Invalid argument:', arguments);
        }
        break;
      case 3:
        // Mode & fn
        if (
          (typeof (arguments[0]) === 'object') &&
          (typeof (arguments[1]) === 'function') &&
          (typeof (arguments[2]) === 'boolean')
        ){
          mode = arguments[0];
          fn = arguments[1];
          parallel = arguments[2];
        } else {
          debug('Invalid argument:', arguments);
        }
        break;
      default:
        debug('Invalid argument:', arguments);
    }
    if (mode.length === 0)
      mode = [modes.OFFLINE, modes.SOFFLINE, modes.SONLINE, modes.ONLINE];
    debug('Registering', mode, fn, parallel);
    if (parallel){
      this.onRequestParallel.push({mode, fn});
    } else {
      this.onRequestSeries.push({mode, fn});
    }
    // Ok
  }

  onRequestDispatch(mode){
    debug(this.onRequestSeries, this.onRequestParallel);
    return ([this.onRequestSeries, this.onRequestParallel]);
  }
}

module.exports.PProvider = PProvider;
