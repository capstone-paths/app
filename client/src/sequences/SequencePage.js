import React, { Component } from 'react';
import LerntApi from '../LerntApi'
import CouseNetworkVis from './CourseNetworkVis/CouseNetworkVis';
import { Icon } from 'semantic-ui-react'

class SequencePage extends Component {
    constructor(props) {
        super(props);
        this.state = {loaded: false};
        this.api = new LerntApi();
        this.api.getSequence(props.match.params.sequenceId)
        .then((response) => {
            console.log(response.data)
            this.setState({loaded:true, data: response.data})
        });
    }
    render() {
        let vis;
        if(this.state.loaded){
            vis = <CouseNetworkVis sequenceId={this.props.match.params.sequenceId}></CouseNetworkVis>
        } else{
            //This will block out the page, which sucks. Working on it. 
            // vis =  <Dimmer active>
            //             <Loader>Loading</Loader>
            //         </Dimmer>
            vis = <div>Loading ... <Icon loading name='spinner' /></div>
        }
    return (
        <div style={{ fontSize: '2em'}}>
            <h1>{this.state.loaded ? this.state.data.sequence.sequence_name : '' }</h1>
            <h3>{this.state.loaded ? this.state.data.sequence.author : '' }</h3>

            {vis}
        </div>
    );
  }
}

export default SequencePage;
