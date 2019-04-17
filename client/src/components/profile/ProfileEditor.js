import React, { Component } from 'react'
import { Button, Dropdown, Form, Header, Icon, Input, Modal, TextArea } from 'semantic-ui-react'
import LerntApi from '../../LerntApi'

const styles = [
    { key: 'activist', text: 'Activist - Learn by doing', value: 'Activist - Learn by doing' },
    { key: 'theorist', text: 'Theorist - Want to undstand the theory behind it', value: 'Theorist - Want to undstand the theory behind it' },
    { key: 'Pragmatist', text: 'Pragmatist - Want the real world application', value: 'Pragmatist - Want the real world application' },
    { key: 'Reflector', text: 'Reflector - Learn by observing', value: 'Reflector - Learn by observing' }
]

class ProfileEditor extends Component {
    constructor(props) {
        super(props);
        this.state = { loaded: false };
        this.api = new LerntApi();
        this.api.getSkills()
            .then((response) => {
                console.log(response.data)
                //map the skill options to work well with the semantic drop downs
                let skillOptions = response.data.skills.map(skill => {
                    return {
                        key: skill.skillID,
                        text: skill.name,
                        value: skill.skillID
                    } 
                });
                this.setState({ loaded: true, skillOptions: skillOptions, user: this.props.user })
            });
    }

    render() {
        console.log(this.state)
        const handleChange = (event, data) => {
            console.log(data);
            this.setState({ [data.name]: data.value });
        }

        const closeModal = () => {
            this.props.closeModal();
        }

        const onFinish = () => {
            const user = {
                bio: this.state.bio,
                username: this.state.username,
                learningType: this.state.learningType,
                interest: this.state.interest,
                experience: this.state.experience
            }
            this.props.onFinish(user);
            this.props.closeModal();
        }
        if (this.state.loaded) {
            return (
                <div>
                    <Modal.Content>
                        <Modal.Description>
                            <Header>Introduce Yourself</Header>
                        </Modal.Description>
                        <Form>
                            <p>What should we call you?</p>
                            <Input name='username' value={this.state.user.username} onChange={handleChange} />
                            <p>What do you do now and what do you want to do?</p>
                            <TextArea name='bio' value={this.state.user.bio} placeholder='Tell us more' onChange={handleChange} />
                            <p>I would describe my learning style as</p>
                            <Dropdown name='learningType' value={this.state.user.learningType} placeholder='None Selected' fluid multiple selection options={styles} onChange={handleChange} />
                            <p>I'm interested in...</p>
                            <Dropdown name='interest' value={this.state.user.interest} placeholder='None Selected' fluid multiple selection options={this.state.skillOptions} onChange={handleChange} />
                            <p>I have experience in...</p>
                            <Dropdown name='experience' value={this.state.user.experience} placeholder='None Selected' fluid multiple selection options={this.state.skillOptions} onChange={handleChange} />
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color='red' onClick={closeModal}>
                            <Icon name='remove' /> Cancel edit, I'd like to come back to this later
                </Button>
                        <Button color='green' onClick={onFinish}>
                            <Icon name='checkmark' /> I'm done sharing!
                </Button>
                    </Modal.Actions>
                </div>

            );
        }
        else {
            return (<div>loading</div>);
        }

    }
}

export default ProfileEditor