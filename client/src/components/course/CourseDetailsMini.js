import React, { Component } from 'react';
import LerntApi from '../../LerntApi'
import { Icon } from 'semantic-ui-react'
import { Header, Grid, List, Checkbox } from 'semantic-ui-react'

class CourseDetailsMini extends Component {
    constructor(props) {
        super(props);
        this.state = { loaded: false };
    }
    shouldComponentUpdate(nextProps, nextState) {
     return true;
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        this.api = new LerntApi();
        if(this.state.course === undefined || this.state.course.courseID !== this.props.courseId){
        this.api.getCourse(this.props.courseId)
            .then((response) => {
                this.setState({ loaded: true, course: response.data.course })
            });
        }
    }
    render() {
        let courseHeader;
        if (this.state.loaded) {
            courseHeader = <div><Grid divided='vertically'>
                <Grid.Row columns={1}>
                    <Grid.Column >
                        <Header>{this.state.course.name}</Header>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns={1}>
                    <Grid.Column>
                        <List>
                            <List.Item>
                            <List.Header>Status</List.Header>
                            <Checkbox slider/>
                            </List.Item>
                            <List.Item>
                                <List.Header>Institution</List.Header>
                                {this.state.course.institution}
                            </List.Item>
                            <List.Item>
                                <List.Header>Subject</List.Header>
                                {this.state.course.subject}
                            </List.Item>
                            <List.Item>
                                <List.Header>Provider</List.Header>
                                {this.state.course.provider}
                            </List.Item>
                            <List.Item>
                                <List.Header>Instructors</List.Header>
                               {Array.isArray(this.state.course.instructors) ? this.state.course.instructors.join(', '): this.state.course.instructors}
                            </List.Item>
                            <List.Item>
                                <List.Header>Course Website</List.Header>
                               <a href={decodeURIComponent(this.state.course.url)}>Visit {this.state.course.provider}</a>
                            </List.Item>
                        </List>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            </div>
        } else {
            //This will block out the page, which sucks. Working on it. 
            // vis =  <Dimmer active>
            //             <Loader>Loading</Loader>
            //         </Dimmer>
            courseHeader = <div>Loading ... <Icon loading name='spinner' /></div>
        }
        return (
            <div >
                {courseHeader}
            </div>
        );
    }
}

export default CourseDetailsMini;
