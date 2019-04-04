import Awesomplete from 'awesomplete';
import 'awesomplete/awesomplete.css';

import React, { Component } from 'react';
import LerntApi from '../../LerntApi'


export default class CouseNetworkVis extends Component {
    constructor(props) {
        super(props);
        this.state = {loaded: false};
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
                list: this.state.courses.map(course => { return { "label": course.name, "value": course } })
            });
            input.addEventListener('awesomplete-selectcomplete', function (e) { console.log(e); }, false);
        }
    }
        return <div>
            <input id="awesomplete" />
        </div>;
    }
}
