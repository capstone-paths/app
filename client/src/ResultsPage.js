import React, { Component } from 'react';
import {
  Grid,
  Tab,
  Segment,
  Form,
  Checkbox,
  Button,
  Menu,
  Icon,
  Header,
  Input,
} from 'semantic-ui-react';
import styled from 'styled-components';

const rigorMap = {
  1: "Easy",
  2: "Medium",
  3: "Difficult"
}

const levelMap = {
  1: "Beginner",
  2: "Intermediate",
  3: "Advanced"
}

class ControlsBox extends Component {
  state = { rigor: 2, level: 2 }

  handleChange = (e, { name, value }) => this.setState({ [name]: value });

  render() {
    const { rigor, level } = this.state;
    return (
      <Grid divided='vertically'>
        <Grid.Row>
          <Grid.Column>
            <h3>Controls</h3>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row columns={1}>
          <Grid.Column>
            <Form style={{'padding-left': '1.5rem', 'padding-right': '1.5rem'}}>
              <Form.Input
                label={`Rigor: ${rigorMap[rigor]}`}
                min={1}
                max={3}
                name='rigor'
                onChange={this.handleChange}
                step={1}
                type='range'
                value={rigor}
              />

              <Form.Input
                label={`Level: ${levelMap[level]}`}
                min={1}
                max={3}
                name='level'
                onChange={this.handleChange}
                step={1}
                type='range'
                value={level}
              />

              <Checkbox 
                toggle
                label={'Include paid'}
              />

            </Form>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row columns={1} >
          <Grid.Column>
            <Button primary fluid style={{"margin-bottom": "10px"}}>
              <Icon name="thumbs up" />
              Follow
            </Button>
            <Button color="orange" fluid>
              <Icon name="refresh" />
              Get Another One
            </Button>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

const ResultsPane = () => (
  <Grid columns={2}>
    <Grid.Column width={5} > <Segment>
        <ControlsBox />
      </Segment>
    </Grid.Column>
    <Grid.Column width={11} >
      <Segment>The graph would go here</Segment>
    </Grid.Column>
  </Grid>

);

const panes = [
  { menuItem: 'System Recommendations', render: () => <Tab.Pane attached={false}><ResultsPane /></Tab.Pane> },
  { menuItem: 'Our Users Recommend', render: () => <Tab.Pane attached={false}>Tab 2 Content</Tab.Pane> },
];

const StyledHeader = styled(Grid)`
  &&& {
    margin-top: 0;
  }
`;

const NavBar = () => (
  <StyledHeader columns={1} verticalAlign='middle'>
    <Grid.Row color='teal'>
      <Grid.Column verticalAlign='middle'>
        <Menu secondary size="huge" inverted>
          <Menu.Item>
            <Header as='h2' inverted>
              <Icon name='graduation cap' size='large'></Icon>
              <Header.Content>lernt.io</Header.Content>
            </Header>
          </Menu.Item>
          <Menu.Item>
            Pathfinder
          </Menu.Item>
          <Menu.Item>
            About
          </Menu.Item>
          <Menu.Item>
            Blog
          </Menu.Item>
          <Menu.Menu position='right'>
            <Menu.Item>
              <Input placeholder='Search...'></Input>
            </Menu.Item>
            <Menu.Item>
              <Icon name="user circle"></Icon>
              Sign In
            </Menu.Item>
          </Menu.Menu>
        </Menu>
      </Grid.Column>
    </Grid.Row>
  </StyledHeader>
);

const ResultsPage = () => {
  return (
    <div>
      <NavBar/>
      <Grid columns={1} style={{'width': '90%', 'margin-left': 'auto', 'margin-right': 'auto'}}>
          <Grid.Column width={16} >
            <Tab
              menu={{ color: 'blue', fluid: true, widths: 2 }}
              panes={panes}
            />
          </Grid.Column>
      </Grid>
    </div>
  );
};

export default ResultsPage;
