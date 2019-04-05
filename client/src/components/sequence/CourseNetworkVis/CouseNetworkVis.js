import vis from 'vis';
import 'vis/dist/vis-network.min.css';

import React, { Component } from 'react';
import LerntApi from '../../../LerntApi'
import './CouseNetworkVis.css';

function findLevel(nodeId, edges) {
  var edge = edges.filter(edge => { return edge.to === nodeId }).pop();
  if (edge.from == null) {
    return 1;
  } else {
    edges = edges.filter(e => {
      return e.from !== edge.from && e.to !== edge.to;
    });
    return 1 + findLevel(edge.from, edges);
  }
}

export default class CouseNetworkVis extends Component {
  constructor(props) {
    super(props);
    this.onCourseSelect = props.onCourseSelect;
    this.api = new LerntApi();
    this.sequenceId = props.sequenceId;
    this.api.getSequence(props.sequenceId)
      .then((response) => {
        var nodes = response.data.courseNodes.map((course) => {
          return {
            font: { multi: "md", face: "arial" },
            color: { background: 'white', border: 'black' },
            id: course.courseID,
            label: "*" + course.name + "*\n" + course.institution,
          };
        })
        let edges = response.data.rels.map((rel) => {
          return {
            from: rel.start,
            to: rel.end,
            arrows: "to",
            color: {
              color: "blue"
            }
          };
        });
        nodes = nodes.map((node) => {
          node.level = findLevel(node.id, edges);
          return node;
        });
        var state = this.state != null ? this.state : {};
        state.nodes = nodes;
        state.edges = edges;
        this.setState(state);
      });
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    var nodes = new vis.DataSet(this.state.nodes);
    var edges = new vis.DataSet(this.state.edges);
    var container = document.getElementById("course-sequence");

    var data = {
      nodes: nodes,
      edges: edges
    };
    var options = {
      manipulation: {
        enabled: true,
        addNode: (nodeData, callback) => {
          var input = document.getElementById("awesomplete");
          //TODO figure out a better way to get value from child component 
          input.addEventListener('awesomplete-selectcomplete',
            e => {
              let course = e.text.value;
              nodeData.font = { multi: "md", face: "arial" };
              nodeData.color = { background: 'white', border: 'black' };
              nodeData.id = course.courseID;
              nodeData.label = "*" + course.name + "*\n" + course.institution;
              //todo something better. The new nodes shouldn't always be level 5
              nodeData.level = 5;
              callback(nodeData);
            },
            false);
        }
      },
      layout: {
        randomSeed: 2,
        hierarchical: {
          direction: "LR"
        }
      },

      nodes: {
        shape: "box",
        margin: 10,
        widthConstraint: {
          maximum: 200
        }
      },
      edges: {
        length: 335
      },
    };
    var network = new vis.Network(container, data, options);
    
    //when a node is selected, communicate to parent page
    network.on("selectNode", (params) => {
      this.onCourseSelect({ selectedCourse: params.node });
      this.selectedCourse = params.nodes[0];
    });

    var input = document.getElementById("awesomplete");
    //TODO figure out a better way to get value from child component 
    input.addEventListener('awesomplete-selectcomplete',
      e => {
        let course = e.text.value;
        var nodeData = {};
        nodeData.font = { multi: "md", face: "arial" };
        nodeData.color = { background: 'white', border: 'black' };
        nodeData.id = course.courseID;
        nodeData.label = "*" + course.name + "*\n" + course.institution;

        nodeData.level = data.nodes._data[this.selectedCourse].level + 1;
        let edgeData = {
          from: this.selectedCourse,
          to: nodeData.id ,
          arrows: "to",
          color: {
            color: "blue"
          }
        };
        //todo something better. The new nodes shouldn't always be level 5
        // nodeData.level = 5;
        data.nodes.add(nodeData);
        data.edges.add(edgeData);
      },
      false);
  }
  render() {
    return <div>
      <div id="course-sequence" className="course-sequence"></div>
    </div>;
  }
}
