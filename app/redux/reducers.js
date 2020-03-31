'use strict';
const { combineReducers } = require('redux');

const appStatus = require('./appStatus');
const plugin = require('./plugin');

const rootReducer = combineReducers({
  appStatus: appStatus.reducer,
  plugin: plugin.reducer,
});

const initialState = {
  appStatus: appStatus.initialState,
  plugin: plugin.initialState,
};

module.exports = {rootReducer, initialState};
