import React, { Component } from 'react';
import LerntApi from "../../LerntApi";
import { Icon, Grid, Segment } from 'semantic-ui-react';

import CourseNetworkVis from './CourseNetworkVis/CourseNetworkVis';

const netState = { IDLE: 0, LOADING: 1, LOADED: 2, ERROR: 3 };

class SysRecommendationPage extends Component {
  state = {
    learningPathState: netState.LOADING,
    learningPathData: undefined,
    error: undefined,
  };

  visRef = React.createRef();

  componentDidMount() {
    const { trackId } = this.props.match.params;

    if (trackId) {
      LerntApi
        .getSystemRecommendation(trackId)
        .then(response => {
          console.log('getSysRecommendation res', response.data);
          this.setState({
            learningPathState: netState.LOADED,
            learningPathData: response.data
          });
        })
        .catch(e => {
          console.log('SysRecommendationPage error: ', e);
          const error = e.response.data.error || 'Could not get a system' +
            ' recommendation at present';
          this.setState({
            learningPathState: netState.ERROR,
            error
          })
        });
    }
  }

  render() {
    let vis;

    if (this.state.learningPathState === netState.LOADED) {
      vis = <CourseNetworkVis
        ref={this.visRef}
        sequenceData={this.state.learningPathData}
      />
    } else if (this.state.learningPathState === netState.LOADING) {
      vis = <div>Loading ... <Icon loading name='spinner' /></div>;
    } else {
      vis = <div>{this.state.error}</div>
    }

    return (
      <div>
        <Segment attached style={{ padding: "0em" }}>
          <Grid celled='internally'>
            <Grid.Row>

              <Grid.Column width={12}>
                {vis}
              </Grid.Column>

              <Grid.Column width={4} style={{ padding: '1.5rem '}}>
                <p>
                  This view shows a system-generated syllabus showing some
                  of the most popular courses for the chosen field. Enjoy!
                </p>
              </Grid.Column>

            </Grid.Row>
          </Grid>
        </Segment>
      </div>
      );
  }
}

export default SysRecommendationPage;
