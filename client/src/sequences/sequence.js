import vis from 'vis'
import React, { Component } from 'react';
import LerntApi from '../LerntApi'
import './Sequence.css';

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
          layout: {
            randomSeed: 2,
            // hierarchical: {
            //   direction: "LR"
            // }
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
          }
        };
        new vis.Network(container, data, options);
    }
    componentDidMount() {
    //   var transformedCourses = this.state.items.map(function(item) {
    //     return {
    //       font: { multi: "md", face: "arial", size:20 },
    //       color: {background:'white', border:'black'},
    //       id: item.id,
    //       label: "*" + item.text + "*\n" + item.start + "\n" + item.school,
    //       level: item.level
    //     };
    //   });
    //   transformedCourses.push(
    //      // we will need a way to automatically add these nodes... 
    //       {
    //       id:100,
    //         color: {background:'white', border:'black'},
    //       shape:'circularImage',
    //       image:'https://image.flaticon.com/icons/png/128/148/148781.png',
    //       level: 3
    //       }
    //       );
    //   var nodes = new vis.DataSet(transformedCourses);
    //   var edges = new vis.DataSet([
    //     {
    //       from: 1,
    //       to: 3,
    //       arrows: "to",
    //       color: {
    //         color: "blue"
    //       }
    //     },
    //     {
    //       from: 2,
    //       to: 4,
    //       arrows: "to",
    //       color: {
    //         color: "blue"
    //       }
    //     },
    //     {
    //       from: 2,
    //       to: 5,
    //       arrows: "to",
    //       color: {
    //         color: "blue"
    //       }
    //     },
    //     {
    //       from: 1,
    //       to: 2,
    //       arrows: "to",
    //       color: {
    //         color: "blue"
    //       }
    //     },
    //      {
    //       from: 4,
    //       to: 100,
    //       arrows: "to",
    //       color: {
    //         color: "blue"
    //       }
    //     }
    //   ]);
    //   var container = document.getElementById("mynetwork");
    //   var data = {
    //     nodes: nodes,
    //     edges: edges
    //   };
    //   var options = {
    //     layout: {
    //       randomSeed: 2,
    //       hierarchical: {
    //         direction: "LR"
    //       }
    //     },
  
    //     nodes: {
    //       shape: "box",
    //       margin: 10,
    //       widthConstraint: {
    //         maximum: 200
    //       }
    //     },
    //     edges: {
    //       length: 235
    //     }
    //   };
    //   var network = new vis.Network(container, data, options);
    //    network.on("click", function (params) {
    //       params.event = "[original event]";
    //       var node = this.getNodeAt(params.pointer.DOM);
    //       if(node !== undefined){
    //           if(node === 100){
    //             alert('get course suggestion');
    //         }
    //                   else{
    //               console.log('click event, getNodeAt returns: ' + this.getNodeAt(params.pointer.DOM));
    //               alert('Course with ID ' + this.getNodeAt(params.pointer.DOM)+ ' clicked');
    //               }
    //       }
    //   });
    }
    render() {
      return <div id="course-sequence" className="course-sequence" />;
    }
  }
