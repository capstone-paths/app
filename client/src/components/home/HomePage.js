import React, { Component } from 'react';
import {
  Button,
  Container,
  Header,
  Icon
} from 'semantic-ui-react'
import { Link } from 'react-router-dom';
class HomePage extends Component {
    render() {
        let bigFont = {fontSize : '3em'};
    return (
        <div style={bigFont}>
          <Container text>
    <Header
      as='h1'
      content='Welcome to Lernt.io'
      style={{
        fontSize: '4em',
        marginTop: '2em'
      }}
    />
    <Header
      as='h2'
      color='grey'
      content='Class is always in session.'
      style={{
        fontSize: '1.7em',
        fontWeight: 'normal',
        marginTop: '1em',
      }}
    />
    <Button as={ Link } to="/login" color='yellow' size='huge'>
       I'd like to recieve my custom Learning Path
      <Icon name='right arrow' /> 
    </Button>
  </Container>
        </div>
        
    );
  }
}

export default HomePage;
