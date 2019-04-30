import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Icon,  Item} from 'semantic-ui-react';

function LearningPathList(props) {
  return (
    <Item.Group divided>
      {props.list.map((value) => {
        const courseLink = "/learning-path/" + value.pathID;
        return (
          <Item>
            <Item.Content>
              <Item.Header>{value.pathName}</Item.Header>
              <Item.Meta>
                <strong>Author: </strong> <span>{value.userName}</span>
              </Item.Meta>
              <Item.Meta>
                <p>{value.description}</p>
              </Item.Meta>
              <Item.Extra>
                <Button color='yellow' floated='right' as={ Link } to={courseLink}>
                  Check it out!
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

export default LearningPathList;

