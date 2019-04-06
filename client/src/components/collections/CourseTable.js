import React, { Component } from 'react';
import {Checkbox,  Label, Rating, Table } from 'semantic-ui-react';

class CourseTable extends Component {
    render() {
        const courses = [{
            id: 1,
            name: "Intro to Web Development",
            completed: true,
            grants: ["html", "CSS", "Javascript"],
            requires: [],
            rating: 4,
            source:"Coursera"
        },
        {
            id: 2,
            name: "Angular",
            completed: false,
            grants: ["TypeScript", "Angular 2"],
            requires: ["JavaScript", "html"],
            rating: 5,
            source:"Coursera"
        }];
        
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
                            <Table.Cell>{value.name}</Table.Cell>
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