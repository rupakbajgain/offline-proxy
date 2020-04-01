'use strict';

module.exports = {
  requires: ['PHASE_0'],
  gives: ['proxy-module.2'],
  init: () => {
    console.log('Hello');
  },
};
