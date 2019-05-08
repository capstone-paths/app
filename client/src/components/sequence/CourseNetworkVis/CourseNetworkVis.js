import vis from 'vis';
import 'vis/dist/vis-network.min.css';

import React, { Component } from 'react';
import './CourseNetworkVis.css';

function findLevel(nodeId, edges) {
  console.log('edges: ', edges);
  console.log('nodeId: ', nodeId);
  const edge = edges.filter(edge => {
    return edge.to === nodeId
  }).pop();
  if (edge ===  undefined || edge.from == null || edge.from === '-1') {
    return 1;
  } else {
    edges = edges.filter(e => {
      return e.from !== edge.from && e.to !== edge.to;
    });
    return 1 + findLevel(edge.from, edges);
  }
}

function courseToNode(course) {
  var color = '#93C2FA';
  switch(course.status) {
    case 'inprogress':
      color = '#ffffbc';
      break;
    case 'completed':
      color = '#baffc9';
      break;
    default:
      color = '#93C2FA'
  } 
  return {
    font: {
      multi: "md",
      color: 'black',
      face: 'helvetica',
      size: 15,
    },
    color: {
      background: color,
      border: color,
    },
    id: course.courseID,
    label: "*" + course.name + "*\n" + course.institution,
  };
}

class CourseNetworkVis extends Component {

  constructor(props) {
    super(props);
    this.onCourseSelect = props.onCourseSelect;

    console.log('CourseNetworkVis sequenceData', props.sequenceData);

    const { courseNodes, rels } = props.sequenceData ? props.sequenceData : {courseNodes: [], rels: []} ;

    let nodes = courseNodes.map(course => {
      return courseToNode(course);
    });

    let edges = rels.map(rel => ({
      from: rel.start,
      to: rel.end,
      arrows: "to",
      color: {
        color: "#6D737A"
      },
      width: 2,
    }));

    nodes = nodes.map((node) => {
      node.level = findLevel(node.id, edges);
      return node;
    });

    this.state = { nodes, edges }

    // moved add node to be stored on "this" so it can be accessed from SequencePage component reference 
    this.addNode = (course) => {
      var nodeData = courseToNode(course);
  
      nodeData.level = this.selectedCourse != null ? this.network.body.data.nodes._data[this.selectedCourse].level + 1 : 1;
      let edgeData = {
        from: this.selectedCourse,
        to: nodeData.id ,
        arrows: "to",
        color: {
          color: "#6D737A"
        },
        width: 2,
      };
  
      this.network.body.data.nodes.add(nodeData);
      this.network.body.data.edges.add(edgeData);
    }
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
        enabled: this.props.useAutoComplete,
        addNode: false
      },
      layout: {
        improvedLayout: true,
        hierarchical: {
          nodeSpacing: 300,
          direction: 'UD',
          sortMethod: 'directed',
          blockShifting: true,
          parentCentralization: true,
          edgeMinimization: true,
        }
      },

      physics : {
        enabled: false,
      },

      nodes: {
        shape: "box",
        margin: 10,
        widthConstraint: {
          maximum: 200,
        },
      },

      edges: {
        smooth: {
          type: 'cubicBezier',
          roundness: 0.2,
        }
      },
    };
    this.network = new vis.Network(container, data, options);
    this.network.enableEditMode();
    // Zoom out so that we can do a nice zoom in next
    this.network.once('initRedraw', () => {
      this.network.moveTo({
        scale: 0.3,
      });
    });

    this.network.once('initRedraw', () => {
      // Compute the y-pos of the first node, center the view on that
      // baseline, then pan up by half of the canvas container size, to get a
      // nice aligned view of the graph along the top
      const first = this.state.nodes.filter(n => n.level === 1).map(n => n.id)[0];
      if (first !== undefined) {
        const firstY = this.network.getPositions(first)[first].y;
        const h = document.getElementById('course-sequence').clientHeight;

        this.network.moveTo({
          position: { x: 0, y: firstY + h / 2 },
          scale: 0.8,
          animation: {
            duration: 1500,
            easingFunction: 'easeInOutCubic'
          }
        });
      }
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
      if(input !== null){
        input.addEventListener('awesomplete-selectcomplete',
          e => {
            let course = e.text.value;
            this.addNode(course);
          },
          false);
      }
    }
  }

  render() {
    return <div>
      <div id="course-sequence" className="course-sequence"></div>
    </div>;
  }
}

export default CourseNetworkVis;
