import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css'
import './App.css';

import Nav from './components/nav/Nav';
import HomePage from './components/home/HomePage';
import Profile from './components/profile/Profile';
import LoginForm from './components/login/LoginForm';
import SignupForm from './components/login/SignupForm';
import SequencePage from './components/sequence/SequencePage';
import { Container } from 'semantic-ui-react';
import CoursePage from './components/course/CoursePage';
import LearningPathDiscoveryPage from './components/sequence/LearningPathDiscovery/LearningPathDiscoveryPage'
import SysRecommendationPage from './components/sequence/SysRecommendationPage';

class App extends Component {
  render() {
    return (
      <div>
        <Nav />
        {/*
        TODO:
        I've removed home from the enclosing container as it wouldn't
        allow me to do full-width sections. This should be a fluid container,
        with each page wrapping their content in a text container to center.
        */}
        <Route exact path="/" component={HomePage}/>
        <Container style={{
        paddingTop: '8em',
      }}>
        <Route exact path="/login" component={LoginForm}/>
        <Route exact path="/signup" component={SignupForm}/>
        <Route exact path="/profile/:userId" component={Profile}/>
        <Route
          path="/learning-path-discovery/:trackId?"
          component={LearningPathDiscoveryPage}
        />
        <Route
          path="/learning-path/system-recommendation/:trackId"
          component={SysRecommendationPage}
        />
        <Route
          exact
          path="/learning-path/:sequenceId"
          component={SequencePage}
        />
        <Route path="/course/:courseId" component={CoursePage}/>

        </Container>
      </div>
    );
  }
}

export default App;
