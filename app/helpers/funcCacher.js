'use strict';

const debug = require('debug')('proxyapp:funcCacher');


// Only functions without side effects can be cached
// No object {} as arg
class FCacher {
  constructor(fn) {
    this.fn = fn;
    this.prevArg = {};
    this.prevResult = null;
  }

  cacheCall(){
    var sameArgs = true;
    var idx;
    debug('comparing:', arguments, this.prevArg);
    for (idx in arguments){
      if (arguments[idx] !== this.prevArg[idx]){
        sameArgs = false;
        break;
      }
    }
    debug('sameArgs:', sameArgs);
    if (!sameArgs){
      this.prevArg = arguments;
      this.prevResult = this.fn(... arguments);
    }
    return this.prevResult;
  }

  updateCall(){
    debug('updateCall');
    this.prevArg = arguments;
    this.prevResult = this.fn(... arguments);
    return this.prevResult;
  }
}

module.exports.FCacher = FCacher;
