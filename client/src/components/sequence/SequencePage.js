import React, { Component } from 'react';
import LerntApi from '../../LerntApi'
import CourseNetworkVis from './CourseNetworkVis/CourseNetworkVis';
import { Icon, Button } from 'semantic-ui-react'
import { Header, Menu, Grid, Segment } from 'semantic-ui-react'
import AddCourseSearch from './AddCourseSearch/AddCourseSearch'
import CourseDetailsMini from '../course/CourseDetailsMini';
import SubscribeToSequenceButton from './SubscribeToSequenceButton/SubscribeToSequenceButton'

class SequencePage extends Component {


  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      sequenceData: undefined,
      currentCourse: undefined,
      courseRecommendations: undefined,
    };
    this.visRef = React.createRef();
  }

  componentDidMount() {
    const { sequenceId } = this.props.match.params;
    LerntApi
      .getSequence(sequenceId)
      .then(response => {
        this.setState({ loaded: true, sequenceData: response.data });
      })
      .catch(e => {
        // TODO: We need error handling
        console.log('SequencePage error: ', e);
      });
  }

  // Arrow functions allow to access 'this' without binding
  // https://medium.freecodecamp.org/react-binding-patterns-5-approaches-for-handling-this-92c651b5af56
  onClick = () => {
    alert('Add course to sequence');
  };

  onCourseSelect = (course) => {
    console.log(this.state);
    const { pathID } = this.state.sequenceData;
    const { selectedCourse } = course;
    LerntApi
      .getSequenceCourseRecommendation('2', pathID, selectedCourse)
      .then(response => {
        this.setState({ courseRecommendations: response.data });
      });
  };

  getCourseDetails = () => {
    const { currentCourse } = this.state;
    console.log(this.state);
    if (!currentCourse) {
      return '';
    }

    return (
      <CourseDetailsMini
        courseId ={currentCourse}
      />
    );
  };

  saveSequence = () => {
    let edges = this.visRef.current.network.body.data.edges._data;
    let rels = Object.keys(edges).map(key => {
      let edge = edges[key];
      return {
        start: edge.from,
        end: edge.to
      }
    });
    let sequence = {
      pathID : this.state.sequenceData.sequence.pathID,
      name : this.state.sequenceData.sequence.name,
      rels : rels,
      //todo replace with context of user 
      userID: '2'
    };
    LerntApi.saveSequence(sequence);
    console.log(edges);
    console.log(rels);
  };

  getCourseRecommendations = () => {
    const { courseRecommendations } = this.state;
    if (!courseRecommendations) {
      return '';
    }

    return (
      courseRecommendations.map(course => (
        <Menu.Item
          name='test'
          onClick={this.onClick}>{course.name}
        </Menu.Item>
      ))
    )
  };

  render() {
    let vis;

    if (this.state.loaded) {
      vis = <CourseNetworkVis
        ref={this.visRef}
        sequenceData={this.state.sequenceData}
        onCourseSelect={this.onCourseSelect}
      />
    } else {
      vis = <div>Loading ... <Icon loading name='spinner' /></div>;
    }

    return (
      <div style={{ fontSize: '2em' }}>

        <Header as='h1' attached='top'>
          {this.state.loaded ? this.state.sequenceData.sequence.name : ''}
          <SubscribeToSequenceButton
            sequenceID={this.props.match.params.sequenceId}
          />
          <Button
            color="green"
            style={{ float: 'right' }}
            onClick={this.saveSequence}>
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
                    {this.getCourseRecommendations()}
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
