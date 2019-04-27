import vis from 'vis';
import 'vis/dist/vis-network.min.css';

import React, { Component } from 'react';
import './CourseNetworkVis.css';

function findLevel(nodeId, edges) {
  const edge = edges.filter(edge => {
    return edge.to === nodeId
  }).pop();
  if (edge.from == null) {
    return 1;
  } else {
    edges = edges.filter(e => {
      return e.from !== edge.from && e.to !== edge.to;
    });
    return 1 + findLevel(edge.from, edges);
  }
}

class CourseNetworkVis extends Component {

  constructor(props) {
    super(props);
    this.onCourseSelect = props.onCourseSelect;

    const { courseNodes, rels } = props.sequenceData;

    let nodes = courseNodes.map(course => {
      return {
        font: { multi: "md", face: "arial" },
        color: { background: 'white', border: 'black' },
        id: course.courseID,
        label: "*" + course.name + "*\n" + course.institution,
      };
    });

    let edges = rels.map(rel => ({
      from: rel.start,
      to: rel.end,
      arrows: "to",
      color: {
        color: "blue"
      },
    }));

    nodes = nodes.map((node) => {
      node.level = findLevel(node.id, edges);
      return node;
    });

    this.state = { nodes, edges }
  }

  componentDidMount() {
    var nodes = new vis.DataSet(this.state.nodes);
    var edges = new vis.DataSet(this.state.edges);
    var container = document.getElementById("course-sequence");

    var data = {
      nodes: nodes,
      edges: edges
    };

    var options = {
      height: '100%',

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
        // TODO: I believe this only applies when no hierarchy
        improvedLayout: true,
        hierarchical: {
          nodeSpacing: 300,
          direction: "UD",
          sortMethod: 'directed',
          blockShifting: true,
          parentCentralization: true,
          edgeMinimization: true,
        }
      },

      physics : {
        enabled: true,
      },

      nodes: {
        shape: "box",
        margin: 10,
        widthConstraint: {
          maximum: 200
        }
      },
      edges: {
        smooth: {
          type: 'cubicBezier',
          roundness: 0.2,
        }
      },
    };
    this.network = new vis.Network(container, data, options);

    // Once the network has rendered, center the view on top-level nodes
    // Doesn't look that great on tablet / mobile -- would need to fix this
    this.network.once('stabilized', () => {
      this.network.moveTo({
        position: { x: 0, y: 0 },
        scale: 0.8,
      });
    });

    // TODO: This should be decoupled from the vis module
    if (this.props.onCourseSelect) {
      //when a node is selected, communicate to parent page
      this.network.on("selectNode", (params) => {
        this.selectedCourse = params.nodes[0];
        this.onCourseSelect({ selectedCourse: params.nodes[0] });
      });
    }

    // TODO: This should be decoupled from the vis module
    if (this.props.useAutoComplete) {
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
  }

  render() {
    return <div>
      <div id="course-sequence" className="course-sequence"></div>
    </div>;
  }
}

export default CourseNetworkVis;
