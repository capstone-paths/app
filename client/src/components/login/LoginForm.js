import React, { Component }from 'react'
import { Link } from 'react-router-dom';
import { Button, Form, Grid, Header, Message, Segment } from 'semantic-ui-react'
import LerntApi from '../../LerntApi'

class LoginForm extends Component {
  constructor(props) {
    super(props);
    window.currentUser = '';
    window.refreshNav();
    this.state = {
      email:'',
      password:''
    };
  }

  handleChange = (event) =>{
    console.log(event.target)
    this.setState({[event.target.name]:event.target.value});
  }
  handleSubmit = () => {
    // We allow a blank password for now
    if( this.state.email !== ''){
      // this.api = new LerntApi();
      this.api = new LerntApi();
        this.api.getUserByEmail(this.state.email)
            .then((response) => {
                var user = response.data; 
                console.log(user);
                window.currentUser = user.userID;
                this.props.history.push(`/profile/${user.userID}`);
            });
    }
  };

  render() {
    const {
      email,
      password
    } = this.state;
    console.log(this.state);

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
              Login to your learning space
            </Header>
            <Form size='large' onSubmit={this.handleSubmit}>
              <Segment stacked>
                <Form.Input
                  fluid
                  name='email'
                  icon='envelope'
                  iconPosition='left'
                  value={email}
                  onChange={this.handleChange}
                  placeholder='E-mail address' />
                <Form.Input
                  fluid
                  name='password'
                  icon='lock'
                  iconPosition='left'
                  value={password}
                  onChange={this.handleChange}
                  placeholder='Password'
                  type='password'
                />
               {/* TODO Make the link to profile dynamic on the context of currently signed in user */}
                <Button color='yellow' fluid size='large' >
                  Login
                </Button>
              </Segment>
            </Form>
            <Message>
              Are you a new Lerner? <Link to="/signup" >Enroll</Link>
            </Message>
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}

export default LoginForm