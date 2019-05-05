import React, {Component}from 'react'
import { Button, Form, Header,  Modal, Rating } from 'semantic-ui-react'
import TreeAnimation from '../home/animations/TreeAnimation';

  class CourseRater extends Component {
    handleRate = (e, { rating, maxRating }) => this.rating = rating

    render (){
        const closeModal = () => {
            var review = {
                'rating': this.rating
            }
            this.props.closeModal(review);
        }

        return (
            
            <div>
            <Modal.Content>
                <Modal.Description>
                    <Header>Congrats on your progress</Header>
                </Modal.Description>
                <Form>
                    <p>How would you rate this course in general?</p>
                    <Rating id="rating" icon='star' defaultRating={0} maxRating={5} size='large' onRate={this.handleRate}/>    
                </Form>
                <TreeAnimation></TreeAnimation>
            </Modal.Content>
            <Modal.Actions>
                <Button color='green' onClick={(e) => {
                    closeModal()
                }}>
                    Continue
                </Button>
            </Modal.Actions>
            </div>

)}}

export default CourseRater