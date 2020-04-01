'use strict';

const store = require('../app/redux/configureStore')();
const actionCreators = require('../app/redux/actionCreators');

module.exports = {
  requires: ['PHASE_10'],
  gives: ['global:store', 'global:actionCreators'],
  init: () => {
    global.store = store;
    global.actionCreators = actionCreators;
  },
};
