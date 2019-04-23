import React, { Component } from 'react';
import LerntApi from '../../LerntApi'
import CouseNetworkVis from './CourseNetworkVis/CouseNetworkVis';
import { Icon, Button } from 'semantic-ui-react'
import { Header, Menu, Grid, Segment } from 'semantic-ui-react'
import AddCourseSearch from './AddCourseSearch/AddCourseSearch'
import CourseDetailsMini from '../course/CourseDetailsMini';
import SubscribeToSequenceButton from './SubscribeToSequenceButton/SubscribeToSequenceButton'

class SequencePage extends Component {

  state = {
    loaded: true,
    sequenceData: undefined,
    currentCourse: undefined,
    courseRecommendations: undefined,
  };

  constructor(props) {
    super(props);
    this.visRef = React.createRef();
  }

  componentDidMount() {
    LerntApi
      .getSequence(this.props.match.params.sequenceId)
      .then(response => {
        this.setState({ loaded: true, sequenceData: response.data })
      });
  }

  // Arrow functions allow to access 'this' without binding
  // https://medium.freecodecamp.org/react-binding-patterns-5-approaches-for-handling-this-92c651b5af56
  onClick = () => {
    alert('Add course to sequence');
  };

  saveSequence = () => {
    alert('saved');
  };

  onCourseSelect = (course) => {
    const { pathId } = this.state.sequenceData;
    const { selectedCourse } = course.selectedCourse;

    LerntApi
      .getSequenceCourseRecommendation('2', pathId, selectedCourse)
      .then(response => {
        this.setState({ courseRecommendations: response.data });
      });
  };

  getCourseDetails = () => {
    if (this.state.currentCourse) {
      return (
        <CourseDetailsMini
          courseId ={this.state.currentCourse}
        />
      )
    }

    return '';
  };

  render() {
    let vis;

    if (this.state.loaded) {
      vis = <CouseNetworkVis ref={this.visRef} sequenceId={this.props.match.params.sequenceId}  onCourseSelect={this.onCourseSelect}></CouseNetworkVis>
    } else {
      vis = <div>Loading ... <Icon loading name='spinner' /></div>
    }

    return (
      <div style={{ fontSize: '2em' }}>
        <Header as='h1' attached='top'>
          {this.state.loaded ? this.state.sequenceData.sequence.name : ''}
          <SubscribeToSequenceButton sequenceID ={this.props.match.params.sequenceId}></SubscribeToSequenceButton>
          <Button color="green" style={{float: 'right'}} onClick={this.saveSequence}>
            Save
            <Icon name='right chevron' />
          </Button>
        </Header>
        <Segment attached style={{ padding: "0em" }}>
          <Grid celled='internally'>
            <Grid.Row>
              <Grid.Column width={12}>
                {vis}
              </Grid.Column>
              <Grid.Column width={4} style={{ padding: "0em" }}>
                <Menu fluid vertical >
                  <Menu.Item>
                    <Header as='h4'>Search Courses</Header>
                    <AddCourseSearch />
                  </Menu.Item>

                  <Menu.Item>
                    <Header as='h4'>Recommended Courses</Header>
                    {this.state.courseRecommendations !== undefined ? this.state.courseRecommendations.map((course) => {
                      return <Menu.Item name='test' onClick={this.onClick}>{course.name}</Menu.Item>
                    }):''}
                  </Menu.Item>
                  <Menu.Item>
                    <Header as='h4'>Sequence Statistics</Header>
                    <p>100% Awesome</p>
                  </Menu.Item>
                  <Menu.Item>
                    {this.getCourseDetails()}
                  </Menu.Item>
                </Menu>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>

      </div>
    );
  }
}

export default SequencePage;
