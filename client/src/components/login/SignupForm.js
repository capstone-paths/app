import React, { Component }from 'react'
import { Link } from 'react-router-dom';
import { Button, Form, Grid, Header, Message, Segment } from 'semantic-ui-react'
import LerntApi from '../../LerntApi'

class SignupForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email:'',
      password:'',
      first:'',
      last:''
    };
  }

  handleChange = (event) =>{
    console.log(event.target)
    this.setState({[event.target.name]:event.target.value});
  }

  handleSubmit = () => {
    // We allow a blank password for now
    if( this.state.email !== ''){
      // const userData = { 
      //   firstname: this.state.first,
      //   lastname: this.state.last,
      //   username: `${this.state.first}_${this.state.last}`,
      //   email: this.state.email,
      //   bio:'' };
      const oathParams = {
        name: `${this.state.first} ${this.state.last}`,
        email: this.state.email,
        password: this.state.password
      }
      this.api = new LerntApi();
      this.api.signUp(oathParams)
            .then((response) => {
                var user = response.data; 
                console.log(user);
                window.localStorage.setItem('currentUser', user.id);
                this.props.history.push(`/profile/${user.id}`);
            });
    }
  };

  render() {
    const {
      email,
      password,
      first,
      last
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
              Sign up to access your learning space
            </Header>
            <Form size='large' onSubmit={this.handleSubmit}>
              <Segment stacked>
                <Form.Input
                  fluid icon='envelope'
                  iconPosition='left'
                  placeholder='E-mail address'
                  name='email'
                  value={email}
                  onChange={this.handleChange} />
                <Form.Input
                  fluid icon='user'
                  iconPosition='left'
                  placeholder='First Name'
                  name='first'
                  value={first}
                  onChange={this.handleChange}/>
                <Form.Input
                  fluid icon='user'
                  iconPosition='left'
                  placeholder='Last Name'
                  name='last'
                  value={last}
                  onChange={this.handleChange}/>
                <Form.Input
                  fluid
                  icon='lock'
                  iconPosition='left'
                  placeholder='Password'
                  type='password'
                  name='password'
                  value={password}
                  onChange={this.handleChange}
                />
                <Button color='yellow' fluid size='large'>
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