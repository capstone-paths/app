import React, { Component } from 'react'
import { Button, Dropdown, Form, Header, Icon, Input, Modal, TextArea } from 'semantic-ui-react'
import LerntApi from '../../LerntApi'

class ProfileEditor extends Component {
    constructor(props) {
        super(props);
        this.state = { loaded: false };
        this.api = new LerntApi();
        this.api.getSkills()
            .then((skillResponse) => {
                this.api.getLearningStyles()
                    .then((styleResponse) => {
                        //map the style options to work well with the semantic drop downs
                        let styleOptions = styleResponse.data.learningStyles.map(style => {
                            return {
                                key: style.learningStyleID,
                                text: style.name + ' - ' + style.description,
                                value: style.learningStyleID
                            }
                        });
                        //map the skill options to work well with the semantic drop downs
                        let skillOptions = skillResponse.data.skills.map(skill => {
                            return {
                                key: skill.skillID,
                                text: skill.name,
                                value: skill.skillID
                            }
                        });
                        this.setState({ loaded: true, skillOptions: skillOptions, styleOptions: styleOptions, user: this.props.user })
                    });
            });

    }

    render() {
        const handleChange = (event, data) => {
            //todo this is a bit messy. There is likely a better way to handle user state changes other than filtering and mapping all the time
            var state = this.state;
            if(['interest','experience'].includes(data.name) ){
                state.user[data.name] = state.skillOptions.filter(s => data.value.includes(s.key)).map(s=> {return {name: s.text, skillID: s.key}});
            }else if(['learningType'].includes(data.name)){
                state.user[data.name] = state.styleOptions.filter(s => data.value.includes(s.key)).map(s=> {return {name: s.text, learningStyleID: s.key}});
            }else{
                state.user[data.name] = data.value; 
            }
            this.setState(state);
        }

        const closeModal = () => {
            this.props.closeModal();
        }

        const onFinish = () => {
            const user = this.state.user;
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
                            <Dropdown name='learningType' value={this.state.user.learningType.map(type => type.learningStyleID)} placeholder='None Selected' fluid multiple selection options={this.state.styleOptions} onChange={handleChange} />
                            <p>I'm interested in...</p>
                            <Dropdown name='interest' value={this.state.user.interest.map(skill => skill.skillID)} placeholder='None Selected' fluid multiple selection options={this.state.skillOptions} onChange={handleChange} />
                            <p>I have experience in...</p>
                            <Dropdown name='experience' value={ this.state.user.experience.map(skill => skill.skillID)} placeholder='None Selected' fluid multiple selection options={this.state.skillOptions} onChange={handleChange} />
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