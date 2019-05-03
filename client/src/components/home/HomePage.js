import React, { Component } from 'react';
import { Grid,  Card, Button, Container, Header, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import TreeAnimation from './animations/TreeAnimation.js';
import './Home.css';

class HomePage extends Component {

  render() {
    return (
      <div id='home-container'>

        {/* Section: Hero */}
        <Grid verticalAlign='middle'>
          <Grid.Row className='hero'>
            <Grid.Column width={16}>
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

            <TreeAnimation />
            <div className='anim-tree-hider' />
          </Grid.Row>
        </Grid>

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
                  <Card
                    raised centered fluid
                    className='category-card'
                    as={Link} to='/learning-path-discovery/1'
                  >
                    <Icon name='react' className='category-card__icon' />
                    <h3>Front-End <br /> Development</h3>
                  </Card>
                </Grid.Column>
                <Grid.Column>
                  <Card
                    raised centered fluid
                    className='category-card'
                    as={Link} to='/learning-path-discovery/5'
                  >
                    <Icon name='node js' className='category-card__icon' />
                    <h3>Back-End <br /> Development</h3>
                  </Card>
                </Grid.Column>
                <Grid.Column>
                  <Card
                    raised centered fluid
                    className='category-card'
                    as={Link} to='/learning-path-discovery/7'
                  >
                    <Icon name='stack overflow' className='category-card__icon' />
                    <h3>Full-Stack <br /> Development</h3>
                  </Card>
                </Grid.Column>
              </Grid.Row>

              <Grid.Row>
                <Grid.Column>
                  <Card
                    raised centered fluid
                    className='category-card'
                    as={Link} to='/learning-path-discovery/8'
                  >
                    <Icon name='apple' className='category-card__icon'/>
                    <h3>iOS <br /> Development</h3>
                  </Card>
                </Grid.Column>
                <Grid.Column>
                  <Card
                    raised centered fluid
                    className='category-card'
                    as={Link} to='/learning-path-discovery/4'
                  >
                    <Icon name='android' className='category-card__icon ' />
                    <h3>Android <br /> Development</h3>
                  </Card>
                </Grid.Column>
                <Grid.Column>
                  <Card
                    raised centered fluid
                    className='category-card'
                    as={Link} to='/learning-path-discovery/3'
                  >
                    <Icon name='python' className='category-card__icon' />
                    <h3>Data <br /> Science</h3>
                  </Card>
                </Grid.Column>
              </Grid.Row>

            </Grid>

            <Header as='h3' align='right'>
              &hellip; or &nbsp;
              <Link to='/learning-path-discovery'>
                search all available categories
              </Link>
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
            <Button
              size='big' color='yellow'
              as={Link} to='/learning-path/new'
            >
              Make a Learning Path
            </Button>
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
              <Icon name='github' />
              <a
                rel="noopener noreferrer" target="_blank"
                href="https://github.com/capstone-paths/app"
                className="link-color-override"
              >
                Fork on GitHub
              </a>
            </Button>
          </Container>
        </Container>
      </div>
    );
  }
}

export default HomePage;
