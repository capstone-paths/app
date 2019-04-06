import React, { Component } from 'react';
import LerntApi from '../../LerntApi'
import { Icon } from 'semantic-ui-react'
import { Header, Menu, Grid, Segment } from 'semantic-ui-react'

class CoursePage extends Component {
    constructor(props) {
        super(props);
        this.state = { loaded: false };
        this.api = new LerntApi();
        this.api.getCourse(props.match.params.courseId)
            .then((response) => {
                this.setState({ loaded: true, data: response.data })
            });
    }
    render() {      
        return (
            <div>Course Page </div>
        );
    }
}

export default CoursePage;
