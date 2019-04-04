import React, { Component } from 'react';
import {
    Button,
    Card,
    Grid,
    Icon
  } from 'semantic-ui-react'
  import { Link } from 'react-router-dom';

class Profile extends Component {
    render (){
        return (
            <Grid>
                <Grid.Column width={6}>
                    <Card textAlign='center'>
                        <Icon color='yellow' name='user circle' size='massive' style={{ margin: '.25em' }} />
                        <Card.Content>
                            <Card.Header>Sam Chao</Card.Header>
                            <Card.Meta>
                                    <span className='date'>Lerner since 2019</span>
                            </Card.Meta>
                            <Card.Description> I'm a management consultant. I spend the bulk of my time in data & analytics, especially in the areas of project management and strategic operations.   </Card.Description>
                        </Card.Content>
                        <Card.Content extra>
                            <a><Icon name='map outline' /> 2 Active Paths</a> 
                            <br></br>
                            <a><Icon name='certificate' /> 1 Path Completed </a>
                        </Card.Content>
                    </Card>
                </Grid.Column>
                <Grid.Column width={10}>
                    <Card style={{ width: '100%' }} >
                        <Card.Content>
                            <Card.Header>Current Courses</Card.Header> 
                        </Card.Content>
                        <Card.Content extra> 
                        <Button color='yellow' fluid size='large' as={ Link } to="/profile">
                            View All Courses
                        </Button>
                </Card.Content>
                    </Card>
                </Grid.Column>
        
          </Grid>
        )
    }
}

export default Profile;