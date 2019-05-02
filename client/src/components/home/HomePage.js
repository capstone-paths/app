import React, { Component } from 'react';
import { Grid, Divider, Card, Button, Container, Header, Icon, Segment } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import './Home.css';

class HomePage extends Component {

  render() {
    return (
      <div id='home-container'>

        {/* Section: Hero */}
        <Grid verticalAlign='middle'>
          <Grid.Row className='hero'>
            <Grid.Column>
              <Container
                className='hero-text'
                text
              >
                <h1>Welcome to Lernt.io</h1>
                <h3>Class is <em>always</em> in session</h3>
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

        {/* Section Start: Categories */}
        <Container fluid className='home-section home-section--categories'>
          <Container text>
            <Header as='h1'>What do you want to learn?</Header>
            <Header as='h3'>
              Browse popular categories for Learning Paths &hellip;
            </Header>

            <Grid columns={3}>

              <Grid.Row>
                <Grid.Column>
                  <Card raised centered fluid className='category-card'>
                    <Icon name='react' className='category-card__icon' />
                    <h3>Front-End <br /> Development</h3>
                  </Card>
                </Grid.Column>
                <Grid.Column>
                  <Card raised centered fluid className='category-card'>
                    <Icon name='node js' className='category-card__icon' />
                    <h3>Back-End <br /> Development</h3>
                  </Card>
                </Grid.Column>
                <Grid.Column>
                  <Card raised centered fluid className='category-card'>
                    <Icon name='stack overflow' className='category-card__icon' />
                    <h3>Full-Stack <br /> Development</h3>
                  </Card>
                </Grid.Column>
              </Grid.Row>

              <Grid.Row>
                <Grid.Column>
                  <Card raised centered fluid className='category-card'>
                    <Icon name='apple' className='category-card__icon'/>
                    <h3>iOS <br /> Development</h3>
                  </Card>
                </Grid.Column>
                <Grid.Column>
                  <Card raised centered fluid className='category-card'>
                    <Icon name='android' className='category-card__icon ' />
                    <h3>Android <br /> Development</h3>
                  </Card>
                </Grid.Column>
                <Grid.Column>
                  <Card raised centered fluid className='category-card'>
                    <Icon name='python' className='category-card__icon' />
                    <h3>Data <br /> Science</h3>
                  </Card>
                </Grid.Column>
              </Grid.Row>

            </Grid>

            <Header as='h3' align='right'>
              &hellip; or search all available categories
            </Header>
          </Container>
        </Container>


        {/* Section: Share Your Knowledge */}
        <Container fluid className='home-section home-section--gray'>
          <Container text>
            <Header as='h1'>Got knowledge you'd like to share?</Header>
            <Header as='h3'>Share a Learning Path with the world!</Header>
            <p>
              Lernt.io not only about planning your own learning - it's about
              sharing what you've learnt with others. With our Learning Path
              editor, you can build and share collections of courses.
              <br />
              Let the world follow the trail that you've blazed!
            </p>
            <Button size='big' color='yellow'>Make a Learning Path</Button>
          </Container>
        </Container>

        {/* Section: About */}
        <Container fluid className='home-section'>
          <Container text>
            <Header as='h1'>About Lernt.io</Header>
            <p>
              Lernt.io was created as a capstone project by an international group of
              students from Harvard Extension School's Masters in Software
              Software Engineering.
            </p>
            <p>
              The code is open source, and available to fork on GitHub.
            </p>
            <Button size='big' color='blue'>
              <Icon name='github' /> Fork on GitHub
            </Button>
          </Container>
        </Container>
      </div>
    );
  }
}

export default HomePage;
