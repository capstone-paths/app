import React, { Component } from 'react';
import LerntApi from '../../LerntApi'
import CouseNetworkVis from './CourseNetworkVis/CouseNetworkVis';
import { Icon } from 'semantic-ui-react'
import { Header, Menu, Grid, Segment } from 'semantic-ui-react'
import AddCourseSearch from './AddCourseSearch/AddCourseSearch'

class SequencePage extends Component {
    constructor(props) {
        super(props);
        this.state = { loaded: false };
        this.api = new LerntApi();
        this.api.getSequence(props.match.params.sequenceId)
            .then((response) => {
                this.setState({ loaded: true, data: response.data })
            });
    }
    render() {
        let vis;
        function onclick() {
            alert('Add course to sequence');
        }
        function onCourseSelect(course){
            console.log('parent sees' + course);
        }
        if (this.state.loaded) {
            vis = <CouseNetworkVis sequenceId={this.props.match.params.sequenceId} onCourseSelect={onCourseSelect}></CouseNetworkVis>
        } else {
            //This will block out the page, which sucks. Working on it. 
            // vis =  <Dimmer active>
            //             <Loader>Loading</Loader>
            //         </Dimmer>
            vis = <div>Loading ... <Icon loading name='spinner' /></div>
        }
      
        return (
            <div style={{ fontSize: '2em' }}>
                <Header as='h1' attached='top'>
                    {this.state.loaded ? this.state.data.sequence.name : ''}
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
                                        <Menu.Item name='test' onClick={onclick}>AWS Security Fundamentals</Menu.Item>
                                        <Menu.Item name='test' onClick={onclick}>The Unix Workbench</Menu.Item>
                                    </Menu.Item>
                                    <Menu.Item>
                                        <Header as='h4'>Sequence Statistics</Header>
                                        <p>100% Awesome</p>
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