import Awesomplete from 'awesomplete';
import 'awesomplete/awesomplete.css';

import React, { Component } from 'react';
import LerntApi from '../../LerntApi'


export default class CouseNetworkVis extends Component {
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
        if (this.state.courses != null) {
            var input = document.getElementById("awesomplete");
            new Awesomplete(input, {
                list: this.state.courses.map(course => { return { "label": course.name, "value": course } }),
                // insert label instead of value into the input.
                replace: function (suggestion) {
                    this.input.value = suggestion.label;
                }
            });
            input.addEventListener('awesomplete-selectcomplete', (e) => {
                console.log(e);
                var state = this.state;
                state.selectedCourse = e.text.value;
                this.setState(state);
            }, false);
        }
    }
    render() {
        function CourseDetails(props) {
            const selectedCourse = props.selectedCourse;
            if (selectedCourse) {
                return <div> <div><label>Course Title: </label>{selectedCourse.name}</div>
                    <div><label>Subject: {selectedCourse.subject}</label></div>
                    <div><label>Institution: {selectedCourse.institution}</label></div>
                </div>;
            } else {
                return <div></div>
            }
        }

        return <div>
            <input id="awesomplete" />
            <CourseDetails selectedCourse={this.state.selectedCourse} />
        </div>;
    }
}
