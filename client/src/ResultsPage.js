import React, { Component } from 'react';
import {
  Grid,
  Tab,
  Segment,
  Form,
  Checkbox,
  Button,
} from 'semantic-ui-react';

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
          </Grid.Column>
        </Grid.Row>

        <Grid.Row columns={1} >
          <Grid.Column>
            <Button primary fluid style={{"margin-bottom": "10px"}}>Follow</Button>
            <Button color="orange" fluid>Get Another One</Button>
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
      <Segment>Column 2</Segment>
    </Grid.Column>
  </Grid>

);

const panes = [
  { menuItem: 'System Recommendations', render: () => <Tab.Pane attached={false}><ResultsPane /></Tab.Pane> },
  { menuItem: 'Our Users Recommend', render: () => <Tab.Pane attached={false}>Tab 2 Content</Tab.Pane> },
];

const ResultsPage = () => {
  return (
    <Grid columns={1}>
        <Grid.Column width={16} >
          <Tab
            menu={{ fluid: true, widths: 2 }}
            panes={panes}
          />
        </Grid.Column>
    </Grid>
  );
};

export default ResultsPage;
