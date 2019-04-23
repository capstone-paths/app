import React, { Component } from 'react';
import LerntApi from '../../../LerntApi'
import { Button, Icon } from 'semantic-ui-react';


export default class SubscribeToSequenceButton extends Component {
    constructor(props) {
        super(props);
        this.state = { loaded: false};
        this.api = new LerntApi();
        this.sequenceId = props.sequenceID;
        //TODO adjust once we have context of user
        this.userId = 2;
        this.api.isSubscribed(this.userId, this.sequenceId).then((response) => {
            var state = this.state;
            state.isSubscribed = response.data;
            this.setState(
                state
            );
        });
    }

    buttonText(){
        if (this.state.isSubscribed){
            return "Unsubscibe";
        }else{
            return "Subscribe";
        }
        }
    buttonColor(){
        if (this.state.isSubscribed){
            return "yellow";
        }
            return "green";
    }
    render() {
        let toggleSubscribe = () => {
            this.api.toggleSubscribe(this.userId, this.sequenceId).then((response) => {
                var state = this.state;
                state.isSubscribed = response.data;
                this.setState(
                    state
                );
                this.forceUpdate();
            });
        }
        return <Button color={this.buttonColor()} style={{float: 'right'}} onClick={toggleSubscribe}>
            {this.buttonText()}
                                <Icon name='right chevron' />
        </Button>

    }
}
