import { combineReducers } from "redux";
import * as currentTime from "./currentTime.jsx";
import * as currentUser from './currentUser.jsx';

export const rootReducer = combineReducers({
  time: currentTime.reducer,
  user: currentUser.reducer
});

export const initialState = {
  time: currentTime.initialState,
  user: currentUser.initialState
};

export default rootReducer