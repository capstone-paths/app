import React, {Component}from 'react'
import { Button, Form, Header,  Modal, Rating } from 'semantic-ui-react'
import TreeAnimation from '../home/animations/TreeAnimation';

  class ProfileEditor extends Component {
    render (){
        const closeModal = () => {
            this.props.closeModal();
        }

        return (
            
            <div>
            <Modal.Content>
                <Modal.Description>
                    <Header>Congrats on your progress</Header>
                </Modal.Description>
                <Form>
                    <p>How would you rate this course in general?</p>
                    <Rating icon='star' defaultRating={0} maxRating={5} size='large' /> 
                    <p>How good of a job has this course done in teaching you the topics it said it would?</p> 
                    <Rating icon='star' defaultRating={0} maxRating={5} size='large'/>                     
                    
                </Form>
                <TreeAnimation></TreeAnimation>
            </Modal.Content>
            <Modal.Actions>
                <Button color='green' onClick={closeModal}>
                    Continue
                </Button>
            </Modal.Actions>
            </div>

)}}

export default ProfileEditor