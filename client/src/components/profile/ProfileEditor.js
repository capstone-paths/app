import React, {Component}from 'react'
import { Button, Dropdown, Form, Header, Icon, Input, Modal, TextArea } from 'semantic-ui-react'

const options = [
    { key: 'angular', text: 'Angular', value: 'angular' },
    { key: 'css', text: 'CSS', value: 'css' },
    { key: 'design', text: 'Graphic Design', value: 'design' },
    { key: 'ember', text: 'Ember', value: 'ember' },
    { key: 'html', text: 'HTML', value: 'html' },
    { key: 'ia', text: 'Information Architecture', value: 'ia' },
    { key: 'javascript', text: 'Javascript', value: 'javascript' },
    { key: 'mech', text: 'Mechanical Engineering', value: 'mech' },
    { key: 'meteor', text: 'Meteor', value: 'meteor' },
    { key: 'node', text: 'NodeJS', value: 'node' },
    { key: 'fullstack', text: 'Full-Stack Engineering', value: 'fullstack' },
    { key: 'python', text: 'Python', value: 'python' },
    { key: 'rails', text: 'Rails', value: 'rails' },
    { key: 'react', text: 'React', value: 'react' },
    { key: 'data', text: 'Data Science', value: 'data' },
    { key: 'ruby', text: 'Ruby', value: 'ruby' },
    { key: 'ui', text: 'UI Design', value: 'ui' },
    { key: 'ux', text: 'User Experience', value: 'ux' },
]

const styles = [
    { key: 'activist', text: 'Activist - Learn by doing', value: 'Activist - Learn by doing' },
    { key: 'theorist', text: 'Theorist - Want to undstand the theory behind it', value: 'Theorist - Want to undstand the theory behind it' },
    { key: 'Pragmatist', text: 'Pragmatist - Want the real world application', value: 'Pragmatist - Want the real world application' },
    { key: 'Reflector', text: 'Reflector - Learn by observing', value: 'Reflector - Learn by observing' }
  ]

  class ProfileEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {...this.props.user}
    }

    render (){
        console.log(this.state)
        const handleChange = (event, data) => {
            console.log(data);
            this.setState({[data.name]: data.value});
        }

        const closeModal = () => {
            this.props.closeModal();
        }

        const onFinish = () => {
            const user = {
                bio: this.state.bio,
                username:this.state.username,
                learningType:this.state.learningType,
                interest:this.state.interest,
                experience:this.state.experience
            }
            this.props.onFinish(user);
            this.props.closeModal();
        }

        return (
            <div>
            <Modal.Content>
                <Modal.Description>
                    <Header>Introduce Yourself</Header>
                </Modal.Description>
                <Form>
                    <p>What should we call you?</p> 
                    <Input name='username' value={this.state.username} onChange={handleChange}/> 
                    <p>What do you do now and what do you want to do?</p> 
                    <TextArea name='bio' value={this.state.bio} placeholder='Tell us more' onChange={handleChange}/>
                    <p>I would describe my learning style as</p>
                    <Dropdown name='learningType' value={this.state.learningType} placeholder='None Selected' fluid multiple selection options={styles} onChange={handleChange} />
                    <p>I'm interested in...</p>
                    <Dropdown name='interest' value={this.state.interest} placeholder='None Selected' fluid multiple selection options={options} onChange={handleChange}/>
                    <p>I have experience in...</p>
                    <Dropdown name='experience' value={this.state.experience}  placeholder='None Selected' fluid multiple selection options={options} onChange={handleChange}/>
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

)}}

export default ProfileEditor