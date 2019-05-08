import React, { Component } from 'react';
// import LerntApi from '../../LerntApi'
import { Modal } from 'semantic-ui-react';
import CourseRater from './CourseRater';
import LerntApi from '../../LerntApi';


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
        this.closeModal = (review) => {
            (new LerntApi()).reviewCourse(this.state.course.courseID, review).then(response=>{
                // var state = this.state;
                // state.openModal = false;
                // this.setState(state);
                //TODO for now reload the page so state is correct. We can figure out a way to do this without a reload 
                window.location.reload();
            });
        }
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if((this.props.course !== undefined) && (this.state.course !== this.props.course)) {
            this.setState({ loaded: true, course: this.props.course })
        }
    }
   
    render(){
        return <Modal 
        open={this.state.openModal}
        >
        <CourseRater onFinish={this.onFinish} user={this.state.user} closeModal={this.closeModal} />
        </Modal>;
    }
}

export default CourseReviewModal;

