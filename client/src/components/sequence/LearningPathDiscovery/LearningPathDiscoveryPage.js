import React, { Component } from 'react';
import { Form, Grid, Accordion, Icon, Menu, Header, Segment, Button } from 'semantic-ui-react';
import CourseNetworkVis from '../CourseNetworkVis/CourseNetworkVis';
import LerntApi from '../../../LerntApi';
import LearningPathList from './LearningPathList';
import ReactAutocomplete from 'react-autocomplete';
import faker from 'faker';


const netState = { IDLE: 0, LOADING: 1, LOADED: 2, ERROR: 3 };

const resultViews = { LEARNING_PATHS: 'learning-paths', PULSE: 'pulse' };

class LearningPathDiscoveryPage extends Component {

  constructor(props) {
    super(props);

    const { trackId } = this.props.match.params;

    this.state = {
      activeIndex: -1,
      activeResultView: resultViews.LEARNING_PATHS,
      searchInput: '',
      trackId,
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
        this.setState({
          trackList: res.data,
          trackListState: netState.LOADED
        });
      })
      .catch(e => {
        const errors = { ...this.state.errors };
        errors.trackList = e.response.data.error || 'Error: track list' +
          ' unavailable';
        this.setState({
          trackListState: netState.ERROR,
          errors
        });
      });

    const { trackId } = this.state;
    if (trackId) {
      this.getLearningPathList(trackId);
      this.getSystemRecommendation(trackId);
    }
  }

  getLearningPathList(trackId) {
    console.log('getLearningPathList trackId', trackId);
    if (!trackId) {
      return;
    }

    LerntApi
      .getAllPathsByTrackID(trackId)
      .then(res => {
        this.setState({
          trackId,
          learningPathList: res.data,
          learningPathListState: netState.LOADED,
        });
      })
      .catch(e => {
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
    console.log('getSystemRecommendation trackId', trackId);
    if (!trackId) {
      return;
    }

    LerntApi
      .getSystemRecommendation(trackId)
      .then(res => {
        this.setState({
          recommendationData: res.data,
          recommendationDataState: netState.LOADED,
          activeResultView: resultViews.LEARNING_PATHS,
        });
      })
      .catch(e => {
        const errors = { ...this.state.errors };
        errors.recommendationData = e.response.data.error || 'Error: could' +
          ' not retrieve system recommendations for track id: ' + trackId;
        this.setState({
          recommendationDataState: netState.ERROR,
          errors,
        });
      });
  }
  remixSystemRecommendation(){
      //TODO this is duped from the sequence page save button. Not ideal
      var edges = this.state.recommendationData.rels;
      //remap -1s to null values.
      edges = edges.map(e => {
        if(e.start === '-1'){
          e.start = null; 
        }
        if(e.end === '-1'){
          e.end = null;
        }
        return e;
      })
      edges = edges.filter(e => e.start !== this.state.trackId && e.end !== this.state.trackId);
      let sequence = {
        pathID : null,
        name : null,
        rels : edges,
        //todo replace with context of user
        userID: '2'
      };
      LerntApi.remixSequence(sequence).then(response => {
        this.props.history.push('/learning-path/' +  response.data.sequence.pathID)
      })
  }

  handleClick = (e, titleProps) => {
    const { index } = titleProps;
    var state = this.state
    state.activeIndex = state.activeIndex === index ? -1 : index
    this.setState(state)
  };


  getSearchInputElement = () => {
    let element;

    switch(this.state.trackListState)
    {
      case netState.LOADED:
        element = document.getElementById('track-search-input');
        const { trackList } = this.state;
        element = (
          <ReactAutocomplete
            items={ trackList.map(t => ({ id: t.trackID, label: t.name })) }
            getItemValue={ item => item.id }
            renderItem={(item, highlighted) =>
              <div
                key={item.id}
                style={{ backgroundColor: highlighted ? '#eee' : 'transparent'}}
              >
                {item.label}
              </div>
            }
            value={this.state.searchInput}
            onChange={e => this.setState({ searchInput: e.target.value })}
            onSelect={(value, item) => {
              this.setState({ searchInput: item.label });
              this.getLearningPathList(value);
              this.getSystemRecommendation(value);
            }}
          />
        );
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

  // TODO: Abstract as its own component
  ResultsList = () => {
    let element;

    switch (this.state.learningPathListState)
    {
      case netState.LOADING:
        element = <div>Loading ... <Icon loading name='spinner' /></div>;
        break;

      case netState.LOADED:
        const list = this.state.learningPathList.map(i => ({
          ...i,
          description: faker.lorem.paragraph(),
        }));
        element = <LearningPathList list={list} />;
        break;

      case netState.ERROR:
        element = <p>{this.state.errors.learningPathList}</p>;
        break;

      default:
        element = (
          <p>
            Nothing here. Search for a track to see available Learning Paths.
          </p>
        );
    }

    return element;
  };

  handleMenuViewClick = (e, { name }) => {
    console.log('handleMenuView click called, name: ', name);
    this.setState({ activeResultView: name });
  };

  renderResults = () => {
    console.log('renderResults called');
    const { activeResultView } = this.state;
    if (activeResultView === resultViews.PULSE) {
      return (
        <div>
          <h4>
            This is a system-generated Learning Path representation of some of the most
            popular courses in the chosen category. Take a look around
            and see if you find anything that tickles your fancy!
          </h4>
          <Segment style={{height: "66vh", overflow: "hidden"}}>
          <Button
                    color="green"
                    style={{ float: 'right' }}
                    onClick={(e) => {
                      this.remixSystemRecommendation();
                    }}>
                    Remix
                    <Icon name='right chevron' />
                  </Button>
            <CourseNetworkVis
              sequenceData={this.state.recommendationData}
            />
          </Segment>

        </div>
      )
    }
    else {
      return this.ResultsList();
    }
  };

  isRecommendationLoaded = () => {
    const { recommendationData, recommendationDataState } = this.state;
    return recommendationDataState === netState.LOADED
      && Object.keys(recommendationData).length >= 0;
  };

  render() {
    // We only consider the page renderable once the search component works
    // If error in fetching the track data, but we still have learning
    // path results, the search component will handle the error individually
    if (this.state.trackListState === netState.LOADING) {
      return <div>Loading ... <Icon loading name='spinner' /></div>;
    }

    const { activeIndex, activeResultView } = this.state;


    return <Grid celled='internally'>
      <Grid.Row>

        <Grid.Column width={4} >
          <Form>
            <Form.Field>
              <label>Search By Category</label>
              {this.getSearchInputElement()}
            </Form.Field>
            <Form.Button >Search</Form.Button>
            {
              this.state.learningPathList.length > 0 &&
              <Accordion>
                <Accordion.Title active={activeIndex === 0} index={0} onClick={this.handleClick}>
                  <Icon name='dropdown' />
                  Filters
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
            }

          </Form>
        </Grid.Column>
        <Grid.Column width={12}>
          <Menu tabular>
            <Menu.Item
              name={resultViews.LEARNING_PATHS}
              active={activeResultView === resultViews.LEARNING_PATHS}
              onClick={this.handleMenuViewClick}
            >
              <Header as="h3">Learning Paths</Header>
            </Menu.Item>
            {
              this.isRecommendationLoaded() &&
              <Menu.Item
                name={resultViews.PULSE}
                active={activeResultView === resultViews.PULSE}
                onClick={this.handleMenuViewClick}
              >
                <Header as="h3">Lerners' Pulse</Header>
              </Menu.Item>
            }
          </Menu>
          {this.renderResults()}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  }
}

export default LearningPathDiscoveryPage