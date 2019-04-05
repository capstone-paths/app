import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Icon,  Item, Label } from 'semantic-ui-react';

class SequenceList extends Component {
    render() {
        const sequences = [{
            id: 1,
            name: "Front End Developer",
            author: "Sam Chao",
            domain: "Front-End Development"
        },
        {
            id: 2,
            name: "Full Stack Developer",
            author: "Sam Chao",
            domain: "Full Stack Development"
        }];
        
        return (
            <Item.Group divided>
            {sequences.map((value) => {
                const courseLink = "/learning-path/" + value.id
                return (
                    <Item>
                        <Item.Content>
                            <Item.Header as='a'>{value.name}</Item.Header>
                            <Item.Meta>
                                <span>{value.author}</span>
                            </Item.Meta>
                            <Item.Extra>
                            <Button color='yellow' floated='right' as={ Link } to={courseLink}>
                                Edit Sequence
                                <Icon name='right chevron' />
                            </Button>
                            <Label> {value.domain}</Label>
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