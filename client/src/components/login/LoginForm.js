import React, { Component }from 'react'
import { Link } from 'react-router-dom';
import { Button, Form, Grid, Header, Message, Segment } from 'semantic-ui-react'
import LerntApi from '../../LerntApi'

class LoginForm extends Component {
  constructor(props) {
    super(props);
    window.localStorage.setItem('currentUser', '');
    window.refreshNav();
    this.state = {
      email:'',
      password:'',
      errorMsg:''
    };
  }

  handleChange = (event) =>{
    this.setState({[event.target.name]:event.target.value});
  }
  handleSubmit = () => {
    if( this.state.email !== ''){
      const oathParams = {
        username: this.state.email,
        password: this.state.password
      }
      this.api = new LerntApi();
      this.api.signIn(oathParams)
      .then((response) => {
        var user = response.data; 
        // TODO: Use Guard function
        window.localStorage.setItem('currentUser', user.id);
        this.props.history.push(`/profile/${user.id}`);     
      }).catch( err => {
        console.log(err);
        this.setState({errorMsg:'Something went wrong. Please make sure all fields are correct.'})
      });
    }
  };

  render() {
    const {
      email,
      password,
      errorMsg
    } = this.state;

    const red = {
      color: 'red'
    };

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
                {errorMsg ? <p style={red}>{errorMsg}</p>:''}
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