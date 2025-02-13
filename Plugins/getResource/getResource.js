'use strict';

const Promise = require('bluebird');
const url = require('url');
const { FCacher } = require('../../app/helpers/funcCacher');
const {createSeriesDispacher} = require('../../app/helpers/dispacherHelpers');
const types = require('../../app/types');

// Active listener for global states
var _version = [];
function init(){
  let action = global.actionCreators.initFunctorsHandle(
    'getResourceHandle',
  );
  global.store.dispatch(action);

  // Active listener
  global.store.subscribe((s) => {
    _version = global.store.getState().functors['getResourceHandle'].version;
  });
}

function _dispachHandler(ctx, next){
  const func = createSeriesDispacher(
    global.store.getState().functors['getResourceHandle'].functors,
  );
  return func(ctx, next);
}

var dispatchHandler = new FCacher(_dispachHandler);

var _oldVersion = 0;
// Return promise for result
function getResource(vPath){
  return new Promise((resolve, reject) => {
    if (_version === _oldVersion){
      dispatchHandler
        .cacheCall(
          {
            query: url.parse(vPath),
            resolve,
            reject,
          },
          () => reject(types.NOT_FOUND),
        );
    } else {
      _oldVersion = _version;
      dispatchHandler
        .updateCall(
          {
            query: url.parse(vPath),
            resolve,
            reject,
          },
          () => reject(types.NOT_FOUND),
        );
    }
  });
}

module.exports = {
  requires: ['global:actionCreators', 'global:store'],
  gives: ['global:getResource'],
  init: () => {
    init();
    global.getResource = getResource;
  },
};
