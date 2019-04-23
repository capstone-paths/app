import React, { Component, forwardRef, useRef, useImperativeHandle  } from 'react';
import LerntApi from '../../LerntApi'
import CouseNetworkVis from './CourseNetworkVis/CouseNetworkVis';
import { Icon, Button } from 'semantic-ui-react'
import { Header, Menu, Grid, Segment } from 'semantic-ui-react'
import AddCourseSearch from './AddCourseSearch/AddCourseSearch'
import CourseDetailsMini from '../course/CourseDetailsMini';
import SubscribeToSequenceButton from './SubscribeToSequenceButton/SubscribeToSequenceButton'

class SequencePage extends Component {
    constructor(props) {
        super(props);
        this.state = { loaded: false, currentCourse: null };
        this.api = new LerntApi();
        this.api.getSequence(props.match.params.sequenceId)
            .then((response) => {
                this.setState({ loaded: true, data: response.data })
            });
        this.visRef = React.createRef();
    }

    render() {
        let vis;

        function onclick() {
            alert('Add course to sequence');
        }
        let saveSequence = () => {
            console.log(this.visRef);
            alert('saved');
        }
        let onCourseSelect = (course) => {
            var state = this.state;
            state.currentCourse = course.selectedCourse;
            this.setState(state);
            this.api.getSequenceCourseRecommendation('2', this.state.data.pathID, course.selectedCourse)
            .then(response => {
                var state = this.state;
                state.courseRecommendations = response.data;
                this.setState(state);
                console.log(response);
            });
        }
        let  getCourseDetails = () => {
            console.log('asdasdasd');
            if(this.state.currentCourse !== null){
                return  <CourseDetailsMini courseId ={this.state.currentCourse} ></CourseDetailsMini>
            }
            return ''
        }

        if (this.state.loaded) {
            vis = <CouseNetworkVis ref={this.visRef} sequenceId={this.props.match.params.sequenceId} selectedCourse={this.state.currentCourse} onCourseSelect={onCourseSelect}></CouseNetworkVis>
        } else {
            //This will block out the page, which sucks. Working on it. 
            // vis =  <Dimmer active>
            //             <Loader>Loading</Loader>
            //         </Dimmer>
            vis = <div>Loading ... <Icon loading name='spinner' /></div>
        }
        console.log('render');
        return (
            <div style={{ fontSize: '2em' }}>
                <Header as='h1' attached='top'>
                    {this.state.loaded ? this.state.data.sequence.name : ''}
                <SubscribeToSequenceButton sequenceID ={this.props.match.params.sequenceId}></SubscribeToSequenceButton>
                <Button color="green" style={{float: 'right'}} onClick={saveSequence}>
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
                                        {this.state.courseRecommendations != undefined ? this.state.courseRecommendations.map((course) => {
                                return <Menu.Item name='test' onClick={onclick}>{course.name}</Menu.Item>
                                        }):''}                                        
                                    </Menu.Item>
                                    <Menu.Item>
                                        <Header as='h4'>Sequence Statistics</Header>
                                        <p>100% Awesome</p>
                                    </Menu.Item>
                                    <Menu.Item>
                                        {getCourseDetails()}
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
