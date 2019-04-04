import React, { Component } from 'react';
import {
    Button,
    Card,
    Grid,
    Header,
    Icon, 
    Label
  } from 'semantic-ui-react'
  import { Link } from 'react-router-dom';
  import SequenceList from '../collections/SequenceList';

class Profile extends Component {
    render (){
        return (
            <Grid >
                <Grid.Column width={6}>
                    <Card textAlign='center'>
                        <Icon color='yellow' name='user circle' size='massive' style={{ margin: '.25em', marginLeft:'.70em' }} /> 
                        <Button floated='right' color='black'> Update your profile</Button>
                        
                        <Card.Content>
                            <Card.Header>Sam Chao</Card.Header>
                            <Card.Meta>
                                    <span className='date'>Lerner since 2019</span>
                            </Card.Meta>
                            <Card.Description> I'm a management consultant. I spend the bulk of my time in data & analytics, especially in the areas of project management and strategic operations.   </Card.Description>
                        </Card.Content>
                        <Card.Content extra>
                            <Icon name='map outline' /> 2 Active Paths
                            <br></br>
                            <Icon name='certificate' /> 1 Path Completed
                        </Card.Content>
                        <Card.Content >
                            <Header as='h3'>Learning Style </Header>
                            <Label> Pragmatist  </Label>
                            <br></br>

                            <Header as='h3'>Areas of Interest </Header>
                            <Label> Front End </Label> <Label> Full Stack</Label>
                            <br></br>
                        </Card.Content>
                        <Card.Content >
                            <Header as='h3'>Expert At </Header>
                             <Label> Data </Label> <Label> Analytics </Label> <Label> R </Label> <Label> SQL </Label>
                            <br></br>
                            <Header as='h3'>Proficient In</Header>
                            <Label>Java</Label> <Label>C</Label>
                            <br></br>
                            <Header as='h3'>Experinece With</Header>
                            <Label>Web Development</Label>
                        </Card.Content>
                    </Card>
                </Grid.Column>
                <Grid.Column width={10} >
                    <Grid.Row >
                        <Card style={{ width: '100%', marginBottom: '2em'}} >
                            <Card.Content>
                                <Card.Header>Current Courses</Card.Header> 
                            </Card.Content>
                            <Card.Content extra> 
                                <Button color='yellow' fluid size='large' as={ Link } to="/profile">
                                    View All Courses
                                </Button>
                            </Card.Content>
                        </Card>
                    </Grid.Row>
                    <Grid.Row>
                    <Card style={{ width: '100%' }} >
                            <Card.Content>
                                <Card.Header>Enrolled Paths</Card.Header> 
                                <SequenceList/>
                            </Card.Content>
                        </Card>
                    </Grid.Row>
                </Grid.Column>
        
          </Grid>
        )
    }
}

export default Profile;