import React, { Component } from 'react';
import {Checkbox,  Label, Rating, Table } from 'semantic-ui-react';

class CourseTable extends Component {
    render() {
        const courses = [{
            id: "6af67908-3910-4742-90cd-bede5fc1c0ff",
            name: "Intro to Web Development",
            completed: true,
            grants: ["html", "CSS", "Javascript"],
            requires: [],
            rating: 4,
            source:"Coursera"
        },
        {
            id: "5a7a1893-fd8d-4e3a-861a-25a85ce0f57c",
            name: "Angular",
            completed: false,
            grants: ["TypeScript", "Angular 2"],
            requires: ["JavaScript", "html"],
            rating: 5,
            source:"Coursera"
        }];
        function getLink(id){
            return '/course/'+id;
        }
        return (
            <Table compact celled >
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Completed?</Table.HeaderCell>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Source</Table.HeaderCell>
                <Table.HeaderCell>Rating</Table.HeaderCell>
                <Table.HeaderCell>What are you learning?</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
        
            <Table.Body>
                {courses.map((value) => {
                    return (
                        <Table.Row>
                            <Table.Cell >
                            <Checkbox slider checked={value.completed}/>
                            </Table.Cell>
                            <Table.Cell><a href={getLink(value.id)}>{value.name}</a></Table.Cell>
                            <Table.Cell>{value.source}</Table.Cell>
                            <Table.Cell><Rating icon='star' defaultRating={value.rating} maxRating={5} disabled /> </Table.Cell>
                            <Table.Cell>{value.grants.map((value) => {
                                return (
                                    <Label> {value}</Label>
                                )
                            })}</Table.Cell>
                        </Table.Row>
                    )

                })}
              
            </Table.Body>
          </Table>
        )
    }
}

export default CourseTable;