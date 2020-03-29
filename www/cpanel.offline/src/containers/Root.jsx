import React from "react";
import App from "./App.jsx";
import { Provider } from "react-redux";
import configureStore from "../redux/configureStore.jsx";

const Root = props => {
  const store = configureStore();
  return(
    <Provider store={store}>
      <App />
    </Provider>
  );
};

export default Root;