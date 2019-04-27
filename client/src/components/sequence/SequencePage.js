import React, { Component } from 'react';
import LerntApi from '../../LerntApi'
import CourseNetworkVis from './CourseNetworkVis/CourseNetworkVis';
import { Icon, Button } from 'semantic-ui-react'
import { Header, Menu, Grid, Input } from 'semantic-ui-react'
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
    if(sequenceId !== 'new'){
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
  }

  // Arrow functions allow to access 'this' without binding
  // https://medium.freecodecamp.org/react-binding-patterns-5-approaches-for-handling-this-92c651b5af56
  onClick = () => {
    alert('Add course to sequence');
  };

  onCourseSelect = (course) => {
    console.log(this.state);
    const { pathID } = this.state.sequenceData !== undefined ? this.state.sequenceData  :  {pathID: 'new'};
    const { selectedCourse } = course;
    var state = this.state;
    state.currentCourse = course.selectedCourse;
    this.setState(state);
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
      pathID : this.state.sequenceData !== undefined ? this.state.sequenceData.sequence.pathID : null,
      name :  document.getElementById('nameInput').value,
      rels : rels,
      //todo replace with context of user
      userID: '2'
    };
    LerntApi.saveSequence(sequence)
    .then(response=>{
      this.setState({ loaded: true, sequenceData: response.data });
      this.props.history.push('/learning-path/' +  response.data.sequence.pathID)
    })
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

    if (this.state.loaded || ( this.props.match.params.sequenceId === 'new') ) {
      vis = <CourseNetworkVis
              ref={this.visRef}
              sequenceData={this.state.sequenceData}
              onCourseSelect={this.onCourseSelect}
              useAutoComplete
            />
    } else {
      vis = <div>Loading ... <Icon loading name='spinner' /></div>;
    }

   return (
      <div style={{ fontSize: '2em'}}>

          <Grid
            celled
            style={{
              "margin-top": 0,
              height: 'calc(100vh - 200px)',
              overflow:'hidden'
            }}
          >
            <Grid.Row style={{ height: "12%" }} >
              <Grid.Column width={16} style={{ padding: "0.8em" }}>

                <Header as='h1'>
                  <Input id="nameInput" style={{width:'20em'}} defaultValue={this.state.loaded ? this.state.sequenceData.sequence.name : ''} />
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

              </Grid.Column>
            </Grid.Row>

            <Grid.Row style={{ height: "88%" }}>

              <Grid.Column width={12}>
                <div style={{ height: "100%", overflow: "hidden" }}>
                  {vis}
                </div>
              </Grid.Column>

              <Grid.Column width={4} style={{ padding: "0em" }}>
                <Menu
                  fluid
                  vertical
                  style={{
                    "box-shadow": "none",
                    border: "none"
                  }}
                >
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

      </div>
    );
  }
}

export default SequencePage;
