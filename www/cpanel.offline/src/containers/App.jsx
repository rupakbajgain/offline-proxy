import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

//import Home from "./views/home.jsx";
//import About from "./views/about.jsx";
import Dashboard from "./views/dashboard.jsx";

const App = props => {
  return (
    <Dashboard/>
  /*
    <Router>
      <Switch>
        <Route path="/about" component={About} />
        <Route path="*" component={Home} />
      </Switch>
    </Router>
    */
  );
};
export default App;