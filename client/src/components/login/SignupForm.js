import React, { Component }from 'react'
import { Link } from 'react-router-dom';
import { Button, Form, Grid, Header, Message, Segment } from 'semantic-ui-react'

class SignupForm extends Component {
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
        <Grid style={{ height: '80%', marginLeft:'25%'}} verticalAlign='middle'>
          <Grid.Column style={{ maxWidth: 600 }}>
            <Header as='h2' color='yellow' textAlign='center'>
              Sign up to access your learning space
            </Header>
            <Form size='large'>
              <Segment stacked>
                <Form.Input fluid icon='envelope' iconPosition='left' placeholder='E-mail address' />
                <Form.Input fluid icon='user' iconPosition='left' placeholder='First Name' />
                <Form.Input fluid icon='user' iconPosition='left' placeholder='Last Name' />
                <Form.Input
                  fluid
                  icon='lock'
                  iconPosition='left'
                  placeholder='Password'
                  type='password'
                />
               {/* TODO Make the link to profile dynamic on the context of currently signed in user */}
                <Button color='yellow' fluid size='large' as={ Link } to="/profile/2">
                  Signup
                </Button>
              </Segment>
            </Form>
            <Message>
              Already have an account? <Link to="/login" >Log in</Link>
            </Message>
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}

export default SignupForm