import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Dropdown,
  Icon,
  Menu
} from 'semantic-ui-react'

export default class Nav extends Component {
  render() {
      return <Menu inverted fixed='top' style={{
        fontSize: '1.25em',
        fontWeight: 'normal',
        marginTop: 0,
        marginBottom: '1em',
      }}>
      <Container>
        <Menu.Item as={ Link } to="/" header>
          <Icon color='yellow' name='graduation cap' size='big' />
          Lernt.io
        </Menu.Item>
        <Menu.Item as={ Link } to="/profile"> Profile</Menu.Item>

        <Dropdown item simple text="Learning Paths">
          <Dropdown.Menu>
          <Dropdown.Header>Sam Chao's</Dropdown.Header>
            <Dropdown.Item as={ Link } to="/learning-path/1">Front End Developer</Dropdown.Item>
            <Dropdown.Item as={ Link } to="/learning-path/2">Full Stack Developer</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Menu.Menu position='right'>
          <Menu.Item  as={ Link } to="/login" >
             Login
          </Menu.Item>
        </Menu.Menu>
      </Container>
    </Menu>
  }
}
