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
        this.state = { loaded: false };
        this.api = new LerntApi();
        this.api.getUser(props.match.params.userId)
            .then((response) => {
                var user = response.data; 
                user.learningType = user.learningType.map(type => type.learningStyleID);
                user.interest = user.interest.map(skill => skill.skillID);
                user.experience = user.experience.map(skill => skill.skillID);
                this.setState({ loaded: true, user: user })
            });
        // this.state = {user: {username:'Sam Chao', 
        //               bio:"I'm a management consultant. I spend the bulk of my time in data & analytics, especially in the areas of project management and strategic operations. ",
        //               learningType:["Activist - Learn by doing"],
        //               interest:["angular","design", "css"],
        //               experience:["data"]
        //             }}
    }
    state = { openModal: false }
    closeModal = () => this.setState({ openModal: false })
    openModal = () => this.setState({ openModal: true })
    editProfile = () => { this.openModal(); }
    onFinish = (user) => {
        console.log(user)
        this.setState({ user: user });
    }
    render() {
        const { openModal } = this.state
        console.log(this.state.user)
        if (this.state.loaded) {
            return (
                <Grid >
                    <Grid.Column width={6}>
                        <ProfileSideBar modalControl={this.editProfile} user={this.state.user} />
                    </Grid.Column>
                    <Grid.Column width={10} >
                        <Grid.Row >
                            <Card style={{ width: '100%', marginBottom: '2em' }} >
                                <Card.Content>
                                    <Card.Header>Current Courses</Card.Header>
                                    <CourseTable />
                                </Card.Content>
                                <Card.Content extra>
                                    <Button color='yellow' fluid size='large' as={Link} to="/profile">
                                        View All Courses
                                    </Button>
                                </Card.Content>
                            </Card>
                        </Grid.Row>
                        <Grid.Row>
                            <Card style={{ width: '100%' }} >
                                <Card.Content>
                                    <Card.Header>Enrolled Paths</Card.Header>
                                    <SequenceList />
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