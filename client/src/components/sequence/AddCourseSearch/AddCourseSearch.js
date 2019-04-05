import Awesomplete from 'awesomplete';
import 'awesomplete/awesomplete.css';

import React, { Component } from 'react';
import LerntApi from '../../../LerntApi'


export default class AddCourseSearch extends Component {
    constructor(props) {
        super(props);
        this.state = { loaded: false };
        this.api = new LerntApi();
        this.sequenceId = props.sequenceId;
        this.api.getCourses().then((response) => {
            var courses = response.data.courses;
            var state = this.state != null ? this.state : {};
            state.courses = courses;
            state.loaded = true;
            this.setState(state);
        });
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.courses != null && this.state.init == null ) {
            var input = document.getElementById("awesomplete");
            new Awesomplete(input, {
                list: this.state.courses.map(course => { return { "label": course.name, "value": course } }),
                // insert label instead of value into the input.
                replace: function (suggestion) {
                    this.input.value = suggestion.label;
                }
            });
            var state = this.state;
            state.init = true;
            this.setState(state);
        }
    }
    render() {
        return <div>
            <input id="awesomplete" />
        </div>;
    }
}
