import React, { Component } from 'react';
import LerntApi from "../../LerntApi";
import { Icon, Grid, Segment } from 'semantic-ui-react';

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
