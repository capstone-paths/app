import React, { Component } from 'react';
import LerntApi from '../../LerntApi'
import { Button } from 'semantic-ui-react';


export default class MarkCourseCompleteButton extends Component {
    constructor(props) {
        super(props);
        this.api = new LerntApi();
        this.course = props.course;
        this.state = {course : props.course};
    }

    buttonText(){
        if (this.state.course.status === 'unstarted'){
            return "Start Course";
        }else if (this.state.course.status === 'inprogress'){
            return "Mark Complete";
        } else{
            return "Unmark Complete";
        }
    }
    buttonColor(){
        return "blue";
    }
    componentDidUpdate(prevProps) {
        if(prevProps.course !== this.props.course) {
          this.setState({course: this.props.course});
        }
    }
    render() {
        let toggleStatus = () => {
            var status = 'inprogress';
            if(this.state.course.status === 'inprogress'){
                status = 'completed';
            }
            LerntApi.updateCourseStatus(this.state.course.courseID, status).then((response) => {
                //TODO improve on the need for full page refresh on course status update
                window.location.reload();
            });
        }
        return <Button size='mini' color={this.buttonColor()} onClick={toggleStatus}>
                {this.buttonText()}
            </Button>
    }
}
