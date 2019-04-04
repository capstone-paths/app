import React, { Component }from 'react'
import { Link } from 'react-router-dom';
import { Button, Form, Grid, Header, Message, Segment } from 'semantic-ui-react'

class LoginForm extends Component {
  render() {
    return(
      <div className='login-form'>
        <style>{`
          body > div,
          body > div > div,
          body > div > div > div.login-form {
            height: 100%;
          }
        `}
        </style>
        <Grid textAlign='center' style={{ height: '80%' }} verticalAlign='middle'>
          <Grid.Column style={{ maxWidth: 600 }}>
            <Header as='h2' color='yellow' textAlign='center'>
              Login to your learning space
            </Header>
            <Form size='large'>
              <Segment stacked>
                <Form.Input fluid icon='user' iconPosition='left' placeholder='E-mail address' />
                <Form.Input
                  fluid
                  icon='lock'
                  iconPosition='left'
                  placeholder='Password'
                  type='password'
                />

                <Button color='yellow' fluid size='large' as={ Link } to="/profile">
                  Login
                </Button>
              </Segment>
            </Form>
            <Message>
              Are you a new Lerner? <a href='#'>Enroll</a>
            </Message>
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}

export default LoginForm