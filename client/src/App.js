import React, { Component } from 'react';
import './App.css';
import Nav from './nav/Nav';

import CouseNetworkVis from './sequences/CouseNetworkVis';

class App extends Component {
  render() {
    return (
      <div className="App"> 
        <Nav></Nav>
        <CouseNetworkVis sequenceId={1}></CouseNetworkVis>
      </div>
    );
  }
}

export default App;
