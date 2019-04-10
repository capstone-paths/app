import React, { Component } from 'react';
import {
    Button,
    Card,
    Grid,
    Icon, 
    Modal
  } from 'semantic-ui-react'
import { Link } from 'react-router-dom';
import SequenceList from '../collections/SequenceList';
import ProfileEditor from './ProfileEditor';
import CourseTable from '../collections/CourseTable';
import ProfileSideBar from './ProfileSidebar';

class Profile extends Component {
    state = {openModal:false}
    closeModal = () => this.setState({ openModal: false })
    openModal = () => this.setState({ openModal: true })
    editProfile = () => {this.openModal();}

    render (){
        const editButton = <Button 
                                id="editButton" 
                                floated='right' 
                                color='black'
                                onClick={this.editProfile}
                                content='Update your profile'> 
                            </Button>
        const {openModal} = this.state

        return (
            <Grid >
                <Grid.Column width={6}>
                    <ProfileSideBar/>
                </Grid.Column>
                <Grid.Column width={10} >
                    <Grid.Row >
                        <Card style={{ width: '100%', marginBottom: '2em'}} >
                            <Card.Content>
                                <Card.Header>Current Courses</Card.Header> 
                                <CourseTable/>
                            </Card.Content>
                            <Card.Content extra> 
                                <Button color='yellow' fluid size='large' as={ Link } to="/profile">
                                    View All Courses
                                </Button>
                            </Card.Content>
                        </Card>
                    </Grid.Row>
                    <Grid.Row>
                    <Card style={{ width: '100%' }} >
                            <Card.Content>
                                <Card.Header>Enrolled Paths</Card.Header> 
                                <SequenceList/>
                            </Card.Content>
                        </Card>
                    </Grid.Row>
                </Grid.Column>
        
                <Modal 
                    open={openModal}
                    onClose={this.close}>
                    <Modal.Header>Tell Us About You</Modal.Header>
                    <Modal.Content >
                        <ProfileEditor/>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color='red' onClick={this.closeModal}>
                            <Icon name='remove' /> Cancel edit, I'd like to come back to this later
                        </Button>
                        <Button color='green' onClick={this.closeModal}>
                            <Icon name='checkmark' /> I'm done sharing!
                        </Button>
                    </Modal.Actions>
                </Modal>
          </Grid>

          
        )
    }
}

export default Profile;