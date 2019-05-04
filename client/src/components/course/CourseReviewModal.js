import React, { Component } from 'react';
// import LerntApi from '../../LerntApi'
import { Modal } from 'semantic-ui-react';
import CourseRater from './CourseRater';


class CourseReviewModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            course: props.course,
            openModal: false
        }
        this.openModal = () => {
            var state = this.state;
            state.openModal = true;
            this.setState(state);
        }
    }
    closeModal(e){
        var state = this.state;
        state.openModal = false;
        this.setState(state);
    }
   
    render(){
        return <Modal 
        open={this.state.openModal}
        >
        <CourseRater onFinish={this.onFinish} user={this.state.user} closeModal={(e) => {
            this.closeModal(e)
          }}/>
        </Modal>;
    }
}

export default CourseReviewModal;

