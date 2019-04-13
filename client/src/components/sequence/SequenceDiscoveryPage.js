import React, { Component } from 'react'
import { Form, Grid, Accordion, Icon, Header } from 'semantic-ui-react'
import SequenceList from '../collections/SequenceList';

class SequenceDiscoveryPage extends Component {
    state = { activeIndex: -1 }

    handleClick = (e, titleProps) => {
        const { index } = titleProps
        var state = this.state
        state.activeIndex = state.activeIndex === index ? -1 : index
        this.setState(state)
    }
    seachSubmit = (e, titleProps) => {
        var state = this.state
        state.results = <SequenceList></SequenceList>
        this.setState(state)
    }
    render() {
        const { activeIndex } = this.state

        return <Grid celled='internally'>
            <Grid.Row>

                <Grid.Column width={4} >
                    <Form>
                        <Form.Group widths='equal'>
                            <Form.Input fluid label='Search' placeholder='Example: Java' />
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

export default SequenceDiscoveryPage