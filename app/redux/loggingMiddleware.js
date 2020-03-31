'use strict';

const debug = require('debug')('proxyapp:reduxLog');

module.exports = (store) => (next) => (action) => {
  // Our middleware
  debug(action);
  // call the next function
  next(action);
};
