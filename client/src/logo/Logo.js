import React, { Component } from 'react';
import logo from './lernt.svg';
import './logo.css';

export default class Logo extends Component {
    render() {
      return <div className="logo">
                <img className="logo-image" src={logo} alt="Lernt logo. Globe ontop of book"></img>lernt.io
            </div>;
    }
}
