import React from "react";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import { fetchNewTime } from '../../redux/actionCreators.jsx';

const Home = (props) => {
  return (
    <div className="home">
      <h1>Welcome home!</h1>
      <p>Current time: {props.currentTime}</p>
      <button onClick={props.updateTime}>
        Update time
      </button>
    </div>
  );
}

import { connect } from "react-redux";
const mapStateToProps = state => {
  return {
    currentTime: state.time.currentTime
  };
};

const mapDispatchToProps = dispatch => ({
  updateTime: () => dispatch(fetchNewTime())
})

export default connect(mapStateToProps, mapDispatchToProps)(Home);