import React, { Component } from 'react';
import {Modal, Table } from 'semantic-ui-react';
import CourseRater from '../profile/CourseRater'

class CourseTable extends Component {
    constructor(props) {
        super(props);
        this.courses = props.courses;
    }
    state = {openModal:false,
            courses: [{
                id: "6af67908-3910-4742-90cd-bede5fc1c0ff",
                name: "Machine Learning for Data Science and Analytics",
                completed: true,
                grants: ["html", "CSS", "Javascript"],
                requires: [],
                rating: 4,
                source:"Coursera"
            },
            {
                id: "5a7a1893-fd8d-4e3a-861a-25a85ce0f57c",
                name: "iOS Persistence and Core Data",
                completed: false,
                grants: ["TypeScript", "Angular 2"],
                requires: ["JavaScript", "html"],
                rating: 5,
                source:"Coursera"
            }]}
    closeModal = () => this.setState({ openModal: false })
    toggle = (event, data) => {
        if (!data.checked){
            const course = this.state.courses.find((course) => { return course.id === data.name; })
            course.completed = false;
            const newCourses = this.state.courses.filter(function(value){

                return value.id !== data.name;
            
            });
            newCourses.push(course);
            this.setState({ courses: newCourses })

        }
        else{
            const course = this.state.courses.find((course) => { return course.id === data.name; })
            course.completed = true;
            const newCourses = this.state.courses.filter(function(value){

                return value.id !== data.name;
            
            });
            newCourses.push(course);

            this.setState({ openModal: true, courses: newCourses })
        }
        
    }
    render() {
        const {openModal} = this.state
        // const courses = this.state.courses;
        function getLink(id){
            return '/course/'+id;
        }
        return (
            <Table compact celled >
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Source</Table.HeaderCell>
                <Table.HeaderCell>Rating</Table.HeaderCell>
                <Table.HeaderCell>What are you learning?</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
        
            <Table.Body>
                {this.courses.map((course) => {
                    return (
                        <Table.Row>
                            <Table.Cell><a href={getLink(course.courseID)}>{course.name}</a></Table.Cell>
                            <Table.Cell>{course.provider}</Table.Cell>
                            <Table.Cell>N/A</Table.Cell>
                            <Table.Cell>N/A</Table.Cell>
                            <Table.Cell >
                                N/A
                            {/* <Checkbox name={course.courseID} checked={course.completed} onClick={this.toggle}/> */}
                            </Table.Cell>
                        </Table.Row>
                    )

                })}
              
            </Table.Body>
            <Modal 
                open={openModal}
                onClose={this.close}>
               <CourseRater onFinish={this.onFinish} user={this.state.user} closeModal={this.closeModal}/>
            </Modal>
          </Table>
        )
    }
}

export default CourseTable;