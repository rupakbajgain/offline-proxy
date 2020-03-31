'use strict';

const types = require('../types');

const initialState = {
  appMode: types.SOFFLINE,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case types.SET_APP_STATE:
      return {
        ...state, appMode: action.payload,
      };
    default:
      return state;
  }
};

module.exports = {reducer, initialState};
