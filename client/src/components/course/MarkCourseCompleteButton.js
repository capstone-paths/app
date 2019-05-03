import React, { Component } from 'react';
import LerntApi from '../../LerntApi'
import { Button, Icon } from 'semantic-ui-react';


export default class MarkCourseCompleteButton extends Component {
    constructor(props) {
        super(props);
        this.api = new LerntApi();
        console.log('hello Mark course complete ' +props);
        this.course = props.course;
        this.state = {course : props.course};
    }

    buttonText(){
        // console.log(this.course);
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
        let toggleComplete = () => {
            // this.api.toggleSubscribe(this.userId, this.sequenceId).then((response) => {
            //     var state = this.state;
            //     state.isSubscribed = response.data;
            //     this.setState(
            //         state
            //     );
            //     this.forceUpdate();
            // });
        }
        return <Button size='mini' color={this.buttonColor()} onClick={toggleComplete}>
            {this.buttonText()}
                                <Icon name='right chevron' />
        </Button>

    }
}
