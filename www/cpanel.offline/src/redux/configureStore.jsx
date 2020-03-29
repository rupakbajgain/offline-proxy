import { createStore, applyMiddleware } from "redux";
import { rootReducer, initialState } from "./reducers.jsx";
import loggingMiddleware from "./loggingMiddleware.jsx";
import apiMiddleware from "./apiMiddleware.jsx";

export const configureStore = () => {
  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(
      loggingMiddleware,
      apiMiddleware
    )
  );
  return store;
};

export default configureStore;