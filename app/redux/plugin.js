'use strict';

const types = require('../types');

const initialState = {
  version: 0,
  // Track version diffrent version mean update cache
  requestSeriesList: [],
  requestParallelList: [],
};

const reducer = (state = initialState, action) => {
  if (action.type === types.PLUGIN){
    switch (action.payload.method){
      case types.ADD_REQUEST_HANDLER:
        if (action.payload.parallel){
          return {
            ...state,
            requestParallelList:
            [
              ... state.requestParallelList,
              {
                provider: action.payload.name,
                handleProvider: action.payload.handleProvider,
              },
            ],
            version: state.version + 1,
          };
        } else {
          return {
            ...state,
            requestSeriesList: [
              ... state.requestSeriesList,
              {
                provider: action.payload.name,
                handleProvider: action.payload.handleProvider,
              },
            ],
            version: state.version + 1,
          };
        }
      default:
        break;
    }
  }
  return state;
};

module.exports = {reducer, initialState};
