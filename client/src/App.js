import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import './App.css';
import Nav from './nav/Nav';

import HomePage from './home/HomePage';
import SequencePage from './sequences/SequencePage';

class App extends Component {
  render() {
    return (
      <div>
        <Nav />
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/learning-path/1">Sam Chao's Front End Developer</Link></li>
          <li><Link to="/learning-path/2">Sam Chao's Full Stack Developer</Link></li>
        </ul>
        
        <Route exact path="/" component={HomePage}/>
        <Route path="/learning-path/:sequenceId" component={SequencePage}/>
      </div>
    );
  }
}

export default App;
