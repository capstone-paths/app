import React, {Component}from 'react'
import { Button, Form, Header, Icon,  Modal, Rating } from 'semantic-ui-react'

  class ProfileEditor extends Component {
    render (){
        const closeModal = () => {
            this.props.closeModal();
        }

        return (
            
            <div>
            <Modal.Content>
                <Modal.Description>
                    <Header>Course Review</Header>
                </Modal.Description>
                <Form>
                    <p>How would you rate this course in general?</p>
                    <Rating icon='star' defaultRating={0} maxRating={5} size='large' /> 
                    <p>How good of a job has this course done in teaching you the topics it said it would?</p> 
                    <Rating icon='star' defaultRating={0} maxRating={5} size='large'/>                     
                    
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button color='red' onClick={closeModal}>
                    <Icon name='remove' /> Cancel
                </Button>
                <Button color='green' onClick={closeModal}>
                    <Icon name='checkmark' /> I'm done rating!
                </Button>
            </Modal.Actions>
            </div>

)}}

export default ProfileEditor