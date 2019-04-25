import React, { Component } from 'react';
import LerntApi from "../../LerntApi";
import { Icon } from 'semantic-ui-react';

import CourseNetworkVis from './CourseNetworkVis/CourseNetworkVis';


class SysRecommendationPage extends Component {
  state = {
    loaded: false,
    sequenceData: undefined,
  };

  visRef = React.createRef();

  componentDidMount() {
    LerntApi
      .getSystemRecommendation('madeupTrack')
      .then(response => {
        console.log('getSysRecommendation res', response.data);
        this.setState({ loaded: true, sequenceData: response.data });
      })
      .catch(e => {
        console.log('SysRecommendationPage error: ', e);
      });
  }

  render() {
    let vis;

    if (this.state.loaded) {
      vis = <CourseNetworkVis
        ref={this.visRef}
        sequenceData={this.state.sequenceData}
      />
    } else {
      vis = <div>Loading ... <Icon loading name='spinner' /></div>;
    }

    return (
      <div>
        {vis}
      </div>
      );
  }
}

export default SysRecommendationPage;
