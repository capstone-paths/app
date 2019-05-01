import React, { Component } from 'react';
import { Grid, Button, Container, Header, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import './Home.css';

class HomePage extends Component {

  render() {
    return (
      <Grid>
        {/* Hero */}
        <Grid.Row
          className='hero'
        >
          I'll be the hero shot
          <Grid.Column>
            <Container
              className='hero-text'
              text
            >
              <h1>Welcome to Lernt.io</h1>
              <h2>Class is <em>always</em> in session</h2>
              <h3>
                Lernt.io helps you plan your lifelong learning, <br />
                discover new content to take your skills further, <br />
                and share your knowledge with others.
              </h3>
            </Container>

          </Grid.Column>

        </Grid.Row>

        {/* Popular Categories */}
        <Grid.Row>
          I'll be the learning path buttons

        </Grid.Row>

        {/* Share Learning Paths */}
        <Grid.Row>
          I'll be the contribute

        </Grid.Row>

        {/* Footer */}
        <Grid.Row>
          I'll be a footer
        </Grid.Row>
      </Grid>
    );
  }
}

export default HomePage;
