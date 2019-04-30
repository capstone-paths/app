import React, { Component } from 'react';
import LerntApi from '../../../LerntApi';
import { Form, Grid, Accordion, Icon, Header } from 'semantic-ui-react'
import SequenceList from '../../collections/SequenceList';

const netState = { IDLE: 0, LOADING: 1, LOADED: 2, ERROR: 3 };

class LearningPathDiscoveryPage extends Component {

  constructor(props) {
    super(props);

    const { trackId } = this.props.match.params;

    this.state = {
      activeIndex: -1,
      searchInput: '',
      trackList: [],
      trackListState: netState.LOADING,
      learningPathList: [],
      learningPathListState: trackId ? netState.LOADING : netState.IDLE,
      recommendationData: {},
      recommendationDataState: trackId ? netState.LOADING : netState.IDLE,
      errors: {
        trackList: '',
        learningPathList: '',
        recommendationData: '',
      }
    };
  }


  componentDidMount() {
    LerntApi
      .getAllTrackNames()
      .then(res => {
        console.log('getAllTrackNames success: ', res.data);
        this.setState({
          trackList: res.data,
          trackListState: netState.LOADED
        });
      })
      .catch(e => {
        console.error('getTrackNames error: ', e);
        const errors = { ...this.state.errors };
        errors.trackList = e.response.data.error || 'Error: track list' +
          ' unavailable';
        this.setState({
          trackListState: netState.ERROR,
          errors
        });
      });

    const { trackId } = this.props.match.params;

    if (trackId) {
      this.getLearningPathList(trackId);
      this.getSystemRecommendation(trackId);
    }
  }

  getLearningPathList(trackId) {
    if (!trackId) {
      return;
    }

    LerntApi
      .getAllPathsByTrackID(trackId)
      .then(res => {
        console.log('getLearningPathList success: ', res.data);
        this.setState({
          learningPathList: res.data,
          learningPathListState: netState.LOADED,
        });
      })
      .catch(e => {
        console.error('getAllPathsByTrackId error: ', e);
        const errors = { ...this.state.errors };
        errors.learningPathList = e.response.data.error || 'Error: could' +
          ' not get learning path list';
        this.setState({
          learningPathListState: netState.ERROR,
          errors,
        })
      });
  }


  getSystemRecommendation(trackId) {
    if (!trackId) {
      return;
    }

    LerntApi
      .getSystemRecommendation(trackId)
      .then(res => {
        console.log('getSystemRecommendation success: ', res.data);
        this.setState({
          recommendationData: res.data,
          recommendationDataState: netState.LOADED,
        });
      })
      .catch(e => {
        console.error('getSystemRecommendation error: ', e);
        const errors = { ...this.state.errors };
        errors.recommendationData = e.response.data.error || 'Error: could' +
          ' not retrieve system recommendations for track id: ' + trackId;
        this.setState({
          recommendationDataState: netState.ERROR,
          errors,
        });
      });
  }


  handleClick = (e, titleProps) => {
    const { index } = titleProps;
    var state = this.state
    state.activeIndex = state.activeIndex === index ? -1 : index
    this.setState(state)
  };


  seachSubmit = (e, titleProps) => {
    var state = this.state
    state.results = <SequenceList></SequenceList>
    this.setState(state)
  };

  getSearchInputElement = () => {
    let element;

    switch(this.state.trackListState)
    {
      case netState.LOADED:
        element = <input />;
        break;
      case netState.ERROR:
        element = <p>{this.state.errors.trackList}</p>;
        break;
      case netState.LOADING:
      default:
        element = <div>Loading ... <Icon loading name='spinner' /></div>;
    }

    return element;
  };

  render() {
    // We only consider the page renderable once the search component works
    // If error in fetching the track data, but we still have learning
    // path results, the search component will handle the error individually
    if (this.state.trackListState === netState.LOADING) {
      return <div>Loading ... <Icon loading name='spinner' /></div>;
    }

    const { activeIndex } = this.state;

    return <Grid celled='internally'>
      <Grid.Row>

        <Grid.Column width={4} >
          <Form>
            <Form.Group widths='equal'>
              {/*<Form.Input fluid label='Search' placeholder='Example: Java' />*/}
              {this.getSearchInputElement()}
            </Form.Group>
            <Accordion>
              <Accordion.Title active={activeIndex === 0} index={0} onClick={this.handleClick}>
                <Icon name='dropdown' />
                Advanced
              </Accordion.Title>
              <Accordion.Content active={activeIndex === 0}>
                <Form.Group inline>
                  <div class="field"><label>Difficulty</label><div class="ui fluid"><input type="range" min="0" max="5" step="1" /></div></div>
                </Form.Group>
                <Form.Group inline>
                  <div class="field"><label>Work Load</label><div class="ui fluid"><input type="range" min="0" max="5" step="1" /></div></div>
                </Form.Group>
                <Form.Group inline>
                  <div class="field"><label>Rating</label><div class="ui fluid"><input type="range" min="0" max="5" step="1" /></div></div>
                </Form.Group>
              </Accordion.Content>
            </Accordion>

            <Form.Button onClick={this.seachSubmit}>Search</Form.Button>
          </Form>
        </Grid.Column>
        <Grid.Column width={12}>
          <Header as="h1">Results</Header>
          {this.state.results}
        </Grid.Column>
      </Grid.Row>
    </Grid>


  }
}

export default LearningPathDiscoveryPage