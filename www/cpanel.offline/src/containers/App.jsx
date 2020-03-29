import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Home from "./views/home.jsx";
import About from "./views/about.jsx";

const App = props => {
  return (
    <Router>
      <Switch>
        <Route path="/about" component={About} />
        <Route path="*" component={Home} />
      </Switch>
    </Router>
  );
};
export default App;