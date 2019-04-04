import vis from 'vis';
import 'vis/dist/vis-network.min.css';

import React, { Component } from 'react';
import LerntApi from '../../LerntApi'
import './CouseNetworkVis.css';
import AddCourseModal from '../AddCourseModal/AddCourseModal'

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
        //created object contained all nodes indexed by id
        let nodesById = {};
        nodes.forEach(node => {
          nodesById[node.id] = node;
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
          input.addEventListener('awesomplete-selectcomplete',
            e => {
              let course = e.text.value;
              nodeData.font = { multi: "md", face: "arial" };
              nodeData.color = { background: 'white', border: 'black' };
              nodeData.id = course.courseID;
              nodeData.label = "*" + course.name + "*\n" + course.institution;
              //todo something better
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
    new vis.Network(container, data, options);
  }
  render() {
    return <div>
      <AddCourseModal />
      <div id="course-sequence" className="course-sequence"></div>
    </div>;
  }
}
