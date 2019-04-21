import Awesomplete from 'awesomplete';
import 'awesomplete/awesomplete.css';

import React, { Component } from 'react';
import LerntApi from '../../../LerntApi'


export default class SequenceSearch extends Component {
    constructor(props) {
        super(props);
        this.state = { loaded: false };
        this.api = new LerntApi();
        this.api.getSequences()
            .then((response) => {
                var sequences = response.data.sequences;
                var state = this.state != null ? this.state : {};
                state.sequences = sequences;
                state.loaded = true;
                this.setState(state);
            });
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.sequences != null && this.state.init == null) {
            var input = document.getElementById("awesomplete");
            new Awesomplete(input, {
                list: this.state.sequences.map(sequence => { return { "label": sequence.name, "value": sequence } }),
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
