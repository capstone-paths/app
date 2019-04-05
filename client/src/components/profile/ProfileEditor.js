import React from 'react'
import { Dropdown, Form, Header, Modal, TextArea } from 'semantic-ui-react'

const options = [
    { key: 'angular', text: 'Angular', value: 'angular' },
    { key: 'css', text: 'CSS', value: 'css' },
    { key: 'design', text: 'Graphic Design', value: 'design' },
    { key: 'ember', text: 'Ember', value: 'ember' },
    { key: 'html', text: 'HTML', value: 'html' },
    { key: 'ia', text: 'Information Architecture', value: 'ia' },
    { key: 'javascript', text: 'Javascript', value: 'javascript' },
    { key: 'mech', text: 'Mechanical Engineering', value: 'mech' },
    { key: 'meteor', text: 'Meteor', value: 'meteor' },
    { key: 'node', text: 'NodeJS', value: 'node' },
    { key: 'fullstack', text: 'Full-Stack Engineering', value: 'fullstack' },
    { key: 'python', text: 'Python', value: 'python' },
    { key: 'rails', text: 'Rails', value: 'rails' },
    { key: 'react', text: 'React', value: 'react' },
    { key: 'data', text: 'Data Science', value: 'data' },
    { key: 'ruby', text: 'Ruby', value: 'ruby' },
    { key: 'ui', text: 'UI Design', value: 'ui' },
    { key: 'ux', text: 'User Experience', value: 'ux' },
]

const styles = [
    { key: 'activist', text: 'Activist - Learn by doing', value: 'activist' },
    { key: 'theorist', text: 'Theorist - Want to undstand the theory behind it', value: 'css' },
    { key: 'Pragmatist', text: 'Pragmatist - Want the real world application', value: 'pragmatist' },
    { key: 'Reflector', text: 'Reflector - Learn by observing', value: 'reflector' }
  ]

const ProfileEditor = () => (
    <div> 
        <Modal.Description>
            <Header>Introduce Yourself</Header>
        </Modal.Description>
    <Form>
        <p>What do you do now and what do you want to do?</p> 
        <TextArea placeholder='Tell us more' />
        <p>I would describe my learning style as</p>
        <Dropdown placeholder='Styles' fluid multiple selection options={styles} />
        <p>I'm interested in...</p>
        <Dropdown placeholder='Everything' fluid multiple selection options={options} />
        <p>I'm an expert at...</p>
        <Dropdown placeholder='None Selected' fluid multiple selection options={options} />
        <p>I'm proficient in...</p>
        <Dropdown placeholder='None Selected' fluid multiple selection options={options} />
        <p>I have experience with...</p>
        <Dropdown placeholder='None Selected' fluid multiple selection options={options} />
    </Form>
   </div>

)

export default ProfileEditor