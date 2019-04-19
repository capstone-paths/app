import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Icon,  Item} from 'semantic-ui-react';

class SequenceList extends Component {
    constructor(props) {
        super(props);
        this.sequences = props.sequences;
    }
    render() {
        return (
            <Item.Group divided>
            {this.sequences.map((value) => {
                const courseLink = "/learning-path/" + value.pathID
                return (
                    <Item>
                        <Item.Content>
                            <Item.Header as='a'>{value.name}</Item.Header>
                            <Item.Meta>
                                <strong>Author: </strong> <span>{value.creator.username}</span>
                            </Item.Meta>
                            <Item.Extra>
                            <Button color='yellow' floated='right' as={ Link } to={courseLink}>
                                Edit Sequence
                                <Icon name='right chevron' />
                            </Button>
                            </Item.Extra>
                        </Item.Content>
                    </Item>
                )

            })}
        
            
          </Item.Group>
        )
    }
}

export default SequenceList;