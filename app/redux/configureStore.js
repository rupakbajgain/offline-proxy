'use strict';

const { createStore, applyMiddleware } = require('redux');
const { rootReducer, initialState } = require('./reducers');
const loggingMiddleware = require('./loggingMiddleware');

const configureStore = () => {
  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(
      loggingMiddleware,
    ),
  );
  return store;
};

module.exports = configureStore;
