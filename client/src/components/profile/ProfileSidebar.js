
import React, { Component } from 'react';
import {
    Button,
    Card,
    Header,
    Icon, 
    Label
  } from 'semantic-ui-react'


class ProfileSidebar extends Component {
    render (){
        return (
            
                    <Card>
                        <Icon color='yellow' name='user circle' size='massive' style={{ margin: '.25em', marginLeft:'.70em' }} /> 
                        <Button 
                                id="editButton" 
                                floated='right' 
                                color='black'
                                onClick={this.props.modalControl}
                                content='Update your profile'> 
                            </Button>
                         
                        <Card.Content>
                            <Card.Header>{this.props.user.username}</Card.Header>
                            <Card.Meta>
                                    <span className='date'>Lerner since 2019</span>
                            </Card.Meta>
                            <Card.Description> {this.props.user.bio} </Card.Description>
                        </Card.Content>
                        <Card.Content extra>
                            <Icon name='map outline' /> 2 Active Paths
                            <br></br>
                            <Icon name='certificate' /> 1 Path Completed
                        </Card.Content>
                        <Card.Content >
                            <Header as='h3'>Learning Style </Header>
                            {this.props.user.learningType.map((value) => {
                                return <Label> {value.name} </Label>
                            })}
                            <br></br>
                            <Header as='h3'>Areas of Interest </Header>
                            {this.props.user.interest.map((value) => {
                                return <Label> {value.name} </Label>
                            })}
                            <br></br>
                        </Card.Content>
                        <Card.Content >
                            
                            <Header as='h3'>Has Experience with</Header>
                            {this.props.user.experience.map((value) => {
                                return <Label> {value.name} </Label>
                            })}
                        </Card.Content>
        </Card> )
        }
    }
        export default ProfileSidebar;

