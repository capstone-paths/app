import React, { Component } from 'react';
import { Grid, Divider, Card, Button, Container, Header, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import './Home.css';

class HomePage extends Component {

  render() {
    return (
      <div id='home-container'>

        {/* Hero */}
        <Grid verticalAlign='middle'>
          <Grid.Row className='hero'>
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
        </Grid>

        <Divider hidden />
        <Divider hidden />

        <Container text>
          <Header as='h1'>What do you want to learn?</Header>
          <Header as='h3'>Browse Learning Paths by Popular Categories</Header>
          <Grid columns={3}>
            <Grid.Row>
              <Grid.Column>
                <Card centered fluid className='category-card'>
                  <Icon name='desktop' size='huge' />
                  <h2>Front-End Development</h2>
                </Card>
              </Grid.Column>
              <Grid.Column>
                <Card centered fluid className='category-card'>
                  <Icon name='server' size='huge' />
                  <h2>Back-End Development</h2>
                </Card>
              </Grid.Column>
              <Grid.Column>
                <Card centered fluid className='category-card'>
                  <Icon name='code' size='huge' />
                  <h2>Full-Stack Development</h2>
                </Card>

              </Grid.Column>

            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Card centered fluid className='category-card'>
                  <Icon name='apple' size='huge' />
                  <h2>iOS <br /> Development</h2>
                </Card>

              </Grid.Column>
              <Grid.Column>
                <Card centered fluid className='category-card'>
                  <Icon name='android' size='huge' />
                  <h2>Android <br /> Development</h2>
                </Card>

              </Grid.Column>
              <Grid.Column>
                <Card centered fluid className='category-card'>
                  <Icon name='calculator' size='huge' />
                  <h2>Data <br /> Science</h2>
                </Card>

              </Grid.Column>

            </Grid.Row>

          </Grid>
        </Container>




      </div>


    );
  }
}

export default HomePage;
