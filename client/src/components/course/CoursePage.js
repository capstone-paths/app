import React, { Component } from 'react';
import LerntApi from '../../LerntApi'
import { Icon } from 'semantic-ui-react'
import { Header, Grid, List, Modal, Button } from 'semantic-ui-react'

class CoursePage extends Component {
    constructor(props) {
        super(props);
        this.state = { loaded: false };
        
        this.api = new LerntApi();
        this.api.getCourse(props.match.params.courseId)
            .then((response) => {
                this.setState({ loaded: true, course: response.data.course })
            });
    }
    
    render() {
        var openSyllabus = () => {
            var state = this.state;
            var open = state.openModal;
            if(open === undefined){
                open = false;
            }
            open = !open;
            state.openModal = open;
            this.setState(state);
        }
        let courseHeader;
        if (this.state.loaded) {
            courseHeader = <div><Grid divided='vertically'>
                <Grid.Row columns={1}>
                    <Grid.Column style={{ fontSize: '2em' }}>
                        <Header>{this.state.course.name}</Header>
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns={2}>
                <Grid.Column style={{ fontSize: '1.25em' }}>
                        {this.state.course.overview}
                        <br/> <br/>
                        <Button 
                                id="seeSyllabus" 
                                floated='left' 
                                color='blue'
                                onClick={openSyllabus}
                                content='See Syllabus'>See Syllabus </Button>
                    </Grid.Column>
                    <Grid.Column>
                        <List style={{ fontSize: '1.25em' }}>
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
                               {this.state.course.instructors.join(', ')}
                            </List.Item>
                            <List.Item>
                                <List.Header>Course Website</List.Header>
                               <a href={decodeURIComponent(this.state.course.url)}>Visit {this.state.course.provider}</a>
                            </List.Item>
                        </List>
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row columns={1}>
                    <Grid.Column>
                        Review Feature Incoming
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            <Modal closeIcon
                open={this.state.openModal}
                onClose={openSyllabus}>
                <Modal.Header>Syllabus</Modal.Header>
                <Modal.Content >
                    {this.state.course.syllabus}
                </Modal.Content>
            </Modal>
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

export default CoursePage;
