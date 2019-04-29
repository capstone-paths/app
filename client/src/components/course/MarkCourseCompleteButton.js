import React, { Component } from 'react';
import LerntApi from '../../LerntApi'
import { Button, Icon } from 'semantic-ui-react';


export default class MarkCourseCompleteButton extends Component {
    constructor(props) {
        super(props);
        this.api = new LerntApi();
        console.log(props);
        this.course = props.course;
    }

    buttonText(){
        return "Mark Complete";
        // if (this.state.isSubscribed){
        //     return "Unsubscibe";
        // }else{
        //     return "Subscribe";
        // }
    }
    buttonColor(){
        return "blue";
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
