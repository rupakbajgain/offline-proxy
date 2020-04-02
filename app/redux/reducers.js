'use strict';
const { combineReducers } = require('redux');

const appStatus = require('./appStatus');
const functors = require('./functors');

const rootReducer = combineReducers({
  appStatus: appStatus.reducer,
  functors: functors.reducer,
});

const initialState = {
  appStatus: appStatus.initialState,
  functors: functors.initialState,
};

module.exports = {rootReducer, initialState};
