'use strict';

import React from 'react';
import {render} from 'react-dom';

import AwesomeComponent from "./js/components/AwesomeComponent";
import { Button } from '@material-ui/core';

function AppH() {
  return <Button variant="contained" color="primary">Hello World</Button>;
}

class App extends React.Component {
  render () {
    return (
      <div>
        <p> Hello React!</p>
        <AppH/>
        <AwesomeComponent />
      </div>
    );
  }
}

render(<App/>, document.getElementById('container'));