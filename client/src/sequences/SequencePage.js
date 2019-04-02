import React, { Component } from 'react';
import LerntApi from '../LerntApi'
import CouseNetworkVis from './CourseNetworkVis/CouseNetworkVis';

class SequencePage extends Component {
    constructor(props) {
        super(props);
        this.state = {loaded: false};
        this.api = new LerntApi();
        this.api.getSequence(props.sequenceId)
        .then((response) => {
            console.log(response.data)
            this.setState({loaded:true, data: response.data})
        });
    }
    render() {
        let vis;
        if(this.state.loaded){
            vis = <CouseNetworkVis sequenceId={1}></CouseNetworkVis>
        } else{
            vis = <div>loading</div>
        }
    return (
        <div>
            test
            <h1>{this.state.loaded ? this.state.data.sequence.sequence_name : '' }</h1>
            <h3>{this.state.loaded ? this.state.data.sequence.author : '' }</h3>

            {vis}
        </div>
    );
  }
}

export default SequencePage;
