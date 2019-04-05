import vis from 'vis';
import 'vis/dist/vis-network.min.css';

import React, { Component } from 'react';
import LerntApi from '../../LerntApi'
import './CouseNetworkVis.css';

export default class CouseNetworkVis extends Component {
    constructor(props) {
      super(props);
      this.api = new LerntApi();
      this.sequenceId = props.sequenceId;
      this.api.getSequence(props.sequenceId)
        .then((response) => {
          console.log(response)
          let nodes = response.data.courseNodes.map((course) => {
            return {
                font: { multi: "md", face: "arial", size:20 },
                color: {background:'white', border:'black'},
                id: course.courseID,
                label: "*" + course.name + "*\n" + course.institution,
              };
          })
          let edges = response.data.rels.map((rel) =>{
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
            addNode: (nodeData,callback) => {
              this.api.getSequenceNodeRecommendation(this.sequenceId)
              .then((response) => {
                console.log(response);
                let course = response.data.data.course;
                nodeData.font =  { multi: "md", face: "arial", size:20 };
                nodeData.color = {background:'white', border:'black'};
                nodeData.id = course.courseID;
                nodeData.label =  "*" + course.name + "*\n" + course.institution;
                callback(nodeData);
              });
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
          interaction:{hover:true}
			    
        };
        new vis.Network(container, data, options);


    }
    render() {
      return <div><div id="course-sequence" className="course-sequence">
         
      </div></div>;
    }
  }
