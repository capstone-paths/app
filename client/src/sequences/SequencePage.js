import React, { Component } from 'react';

import CouseNetworkVis from './sequences/CourseNetworkVis/CouseNetworkVis';

class SequencePage extends Component {
  render() {
    return (
        <CouseNetworkVis sequenceId={1}></CouseNetworkVis>
    );
  }
}

export default SequencePage;
