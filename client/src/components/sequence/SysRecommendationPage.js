import React, { Component } from 'react';
import LerntApi from "../../LerntApi";


class SysRecommendationPage extends Component {
  state = {
    loaded: false,
    learningPathData: undefined,
  };

  componentDidMount() {
    LerntApi
      .getSystemRecommendation('madeupTrack')
      .then(response => {
        this.setState({ loaded: true, learningPathData: response.data });
      });
  }

  render() {
    return (
      <div>
        {'Hello world!'}
      </div>
      );
  }
}

export default SysRecommendationPage;
