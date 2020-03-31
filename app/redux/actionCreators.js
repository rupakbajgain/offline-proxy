'use strict';
const types = require('../types');

// Set app state
module.exports.setAppState = (newState) => ({
  type: types.SET_APP_STATE,
  payload: newState,
});

// Notify a plugin has been added to system
module.exports.addPlugin = (name) => ({
  type: types.PLUGIN,
  payload: {
    method: types.ADD_PLUGIN,
    name,
  },
});

// Remove plugin
module.exports.removePlugin = (name) => ({
  type: types.PLUGIN,
  payload: {
    method: types.REMOVE_PLUGIN,
    name,
  },
});

// for onRequestHandlers
module.exports.registerRequestHandler =
    (name, handleProvider, parallel = false) => ({
      type: types.PLUGIN,
      payload: {
        method: types.ADD_REQUEST_HANDLER,
        name,
        handleProvider,
        parallel,
      },
    });
