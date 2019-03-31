import vis from 'vis';
import 'vis/dist/vis-network.min.css';

import React, { Component } from 'react';
import LerntApi from '../LerntApi'
import './CouseNetworkVis.css';

export default class CouseNetworkVis extends Component {
    constructor(props) {
      super(props);
      let api = new LerntApi();
      api.getSequence(props.sequenceId)
        .then((response) => {
          console.log(response)
          let nodes = response.data.data.courseNodes.map((course) => {
            return {
                font: { multi: "md", face: "arial", size:20 },
                color: {background:'white', border:'black'},
                id: course.nodeId,
                label: "*" + course.name + "*\n" + course.institution,
              };
          })
          let edges = response.data.data.rels.map((rel) =>{
            return {
                    from: rel.start,
                    to: rel.end,
                    arrows: "to",
                    color: {
                      color: "blue"
                    }
                  };
          });
          console.log(edges)
          this.setState({
              nodes: nodes,
              edges: edges
          })
     });
      this.sequenceId = props.sequenceId;
    }
    componentDidUpdate(prevProps, prevState, snapshot){
        var nodes = new vis.DataSet(this.state.nodes);
        var edges = new vis.DataSet(this.state.edges);
        var container = document.getElementById("course-sequence");
        console.log(edges);
        var data = {
          nodes: nodes,
          edges: edges
        };
        var options = {
          manipulation: {
            enabled: true,
            addNode: function(nodeData,callback) {
              nodeData.label = 'hello world';
              callback(nodeData);
            }
			    },
          layout: {
            randomSeed: 2,
          },
    
          nodes: {
            shape: "box",
            margin: 10,
            widthConstraint: {
              maximum: 200
            }
          },
          edges: {
            length: 235
          },
          interaction:{hover:true}
			    
        };
        new vis.Network(container, data, options);


    }
    render() {
      return <div><div id="course-sequence" className="course-sequence">
         
      </div></div>;
    }
  }
