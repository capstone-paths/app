import React, { Component } from 'react';
import './App.css';
import Nav from './nav/Nav';

import SequencePage from './sequences/SequencePage';

class App extends Component {
  render() {
    return (
      <div className="App"> 
        <Nav></Nav>
        <SequencePage sequenceId={1}></SequencePage>
      </div>
    );
  }
}

export default App;
