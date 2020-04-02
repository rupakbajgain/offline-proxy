'use strict';

const types = require('../types');

const initialState = {
  // list has both version and functor type name
};

const reducer = (state = initialState, action) => {
  if (action.type === types.FUNCTOR_HELPER){
    let name = action.payload.name;
    switch (action.payload.method){
      case types.INIT_FUNCTOR_HANDLE:
        return {
          ...state,
          [name]:
              {
                version: 0,
                functors: [],
              },
        };
        break;
      case types.ADD_FUNCTOR_HANDLE:
        return {
          ...state,
          [name]: {
            version: state[name].version + 1,
            functors: [action.payload.handleProvider, ... state[name].functors],
          },
        };
      default:
        break;
    }
  }
  return state;
};

module.exports = {reducer, initialState};
