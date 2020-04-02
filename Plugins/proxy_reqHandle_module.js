'use strict';

const chalk = require('chalk');
const debug = require('debug')('proxyapp:onError');
const { FCacher } = require('../app/middlewareHelper/funcCacher');
const {createSeriesDispacher , createParallelDispacher } = require('../app/dispacherHelpers');

// Active listener for global states
var _versionSeries=[];
var _versionParallel=[];
var _applicationState=[];
function init(){
  let action = global.actionCreators.initFunctorsHandle(
    'getRequestSeriesHandle',
  );
  global.store.dispatch(action);
  action = global.actionCreators.initFunctorsHandle(
    'getRequestParallelHandle',
  );
  global.store.dispatch(action);
  
  // Active listener
  global.store.subscribe((s) => {
    let state = global.store.getState();
    _versionSeries = state.functors['getRequestSeriesHandle'].version;
    _versionParallel = state.functors['getRequestParallelHandle'].version;
    _applicationState = state.appStatus.appMode;
  });
}

function _dispachHandler(appState){
  var state = global.store.getState();
  let series = state.functors['getRequestSeriesHandle'].functors.reverse();
  let parallel = state.functors['getRequestParallelHandle'].functors;
  const serialFunc = createSeriesDispacher(
    series.map(a=>a(appState))
  );
  const parallFunc = createParallelDispacher(
    [... parallel.map(a=>a(appState)), serialFunc]
  );
  return parallFunc;
}

var dispatchHandler = new FCacher(_dispachHandler);

var _oldVersionSeries;
var _oldVersionParallel;
var _oldMode;
const mod = {
  onRequest: async function(ctx, callback) {
    var result;
    if ((_oldVersionSeries !== _versionSeries)||(_oldVersionParallel !== _versionParallel) || (_oldMode!=_applicationState)){
      _oldVersionSeries = _versionSeries;
      _oldVersionParallel = _versionParallel;
      _oldMode = _applicationState;
      result = dispatchHandler.updateCall(
        _applicationState,
      );
    } else {
      result = dispatchHandler.cacheCall(
        _applicationState,
      );
    }
    result(ctx, callback);
  },
};

module.exports = {
  requires: ['global:proxy', 'global:helperApp', 'global:actionCreators', 'global:store'],
  gives: ['proxy-module/3'],
  init: () => {
    init();
    global.proxy.use(mod);
  },
};
