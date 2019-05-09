import React, { Component } from 'react';
import {
    Button,
    Card,
    Grid,
    Modal
} from 'semantic-ui-react'
import { Link } from 'react-router-dom';
import SequenceList from '../collections/SequenceList';
import ProfileEditor from './ProfileEditor';
import CourseTable from '../collections/CourseTable';
import ProfileSideBar from './ProfileSidebar';
import LerntApi from '../../LerntApi'

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            loaded: false,
            authorized: false };
        if (window.localStorage.getItem('currentUser') === props.match.params.userId) {
            window.refreshNav();
            this.api = new LerntApi();
            this.api.getUser(props.match.params.userId)
                .then((response) => {
                    var user = response.data; 
                    console.log(user);
                    this.setState({ loaded: true, user: user, authorized: true })
                });
        }
    }
    state = { openModal: false }
    closeModal = () => this.setState({ openModal: false })
    openModal = () => this.setState({ openModal: true })
    editProfile = () => { this.openModal(); }
    onFinish = (user) => {
        this.api.saveUser(user)
            .then((response) => {
                var user = response.data; 
                this.setState({ loaded: true, user: user })
            });
    }
    render() {
        const { openModal, authorized } = this.state
        if (!authorized){
            return <div>You are not authorized to view this page </div>
        }
        if (this.state.loaded) {
            return (
                <Grid >
                    <Grid.Column width={6}>
                        <ProfileSideBar modalControl={this.editProfile} user={this.state.user} />
                    </Grid.Column>
                    <Grid.Column width={10} >
                        <Grid.Row >
                        <h2>Welcome, {this.state.user.username}</h2>
                        <p>
                            Your profile is the place to keep track of all your learning activity! Manage your in-progress courses and subscribed paths below. 
                            <br></br>Keeping your profile information up to date not only helps us generate recommendations, 
                            but it also reminds you of where you are, where you came from, and where you want to be! 
                        </p>
                            <Card style={{ width: '100%', marginBottom: '2em' }} >
                                <Card.Content>
                                    <Card.Header>Current Courses</Card.Header>
                                    <CourseTable courses={this.state.user.currentCourses}/>
                                </Card.Content>
                            </Card>
                        </Grid.Row>
                        <Grid.Row>
                            <Card style={{ width: '100%' }} >
                                <Card.Content>
                                    <Card.Header>Active Paths </Card.Header>
                                    <SequenceList sequences={this.state.user.learningPaths} />
                                </Card.Content>
                                <Card.Content extra>
                                    <Button color='yellow' fluid size='small' as={Link} to="/learning-path/new">New Path</Button>
                                </Card.Content>
                            </Card>
                        </Grid.Row>
                    </Grid.Column>

                    <Modal
                        open={openModal}
                        onClose={this.close}>
                        <ProfileEditor onFinish={this.onFinish} user={this.state.user} closeModal={this.closeModal} />

                    </Modal>
                </Grid>);
        } else {
            return (<div>loading </div>);
        }
    }
}

export default Profile;