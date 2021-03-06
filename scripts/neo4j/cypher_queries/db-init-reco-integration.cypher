// db-init-base-model

// This represents the current base working model of Neo4
// Please do not alter this file without checking with the team
// -- things will very likely break in the server


CREATE(ls0: LearningStyle {learningStyleID: '0', name:'Activist', description: 'Learn by doing'})
CREATE(ls1: LearningStyle {learningStyleID: '1', name:'Theorist', description: 'Want to undstand the theory behind it'})
CREATE(ls2: LearningStyle {learningStyleID: '2', name:'Pragmatist', description: 'Want the real world application'})
CREATE(ls3: LearningStyle {learningStyleID: '3', name:'Reflector', description: 'Learn by observing'})

CREATE(s1: Skill {skillID: '1', name:'Angular'})
CREATE(s2: Skill {skillID: '2', name:'CSS'})
CREATE(s3: Skill {skillID: '3', name:'Graphic Design'})
CREATE(s4: Skill {skillID: '4', name:'Ember'})
CREATE(s5: Skill {skillID: '5', name:'HTML'})
CREATE(s6: Skill {skillID: '6', name:'Information Architecture'})
CREATE(s7: Skill {skillID: '7', name:'Javascript'})
CREATE(s8: Skill {skillID: '8', name:'Mechanical Engineering'})
CREATE(s9: Skill {skillID: '9', name:'Meteor'})
CREATE(s10: Skill {skillID: '10', name:'NodeJS'})
CREATE(s11: Skill {skillID: '11', name:'Full-Stack Engineering'})
CREATE(s12: Skill {skillID: '12', name:'Python'})
CREATE(s13: Skill {skillID: '13', name:'Rails'})
CREATE(s14: Skill {skillID: '14', name:'React'})
CREATE(s15: Skill {skillID: '15', name:'Data Science'})
CREATE(s16: Skill {skillID: '16', name:'Ruby'})
CREATE(s17: Skill {skillID: '17', name:'UI Design'})
CREATE(s18: Skill {skillID: '18', name:'User Experience'})



// Create some test users
CREATE ( u001: User { userID: '0', username: 'PJ', bio: '' } )
CREATE ( u002: User { userID: '1', username: 'Ajay', bio: '' } )
CREATE ( u003: User { userID: '2', username: 'Sam', bio: "I'm a management consultant. I spend the bulk of my time in data & analytics, especially in the areas of project management and strategic operations." } )
CREATE ( u004: User { userID: '3', username: 'Jon', bio: '' } )
CREATE ( u005: User { userID: '4', username: 'Stephen', bio: ''} )

// This is a trick to separate commands
WITH count(*) as dummy

// Use this pattern for substituion
// OPTIONAL MATCH (xxxx: Course) WHERE toLower(x.name) CONTAINS 'x'

// Sam Sequence #1 Courses
MATCH (pfjs: Course) WHERE toLower(pfjs.name) CONTAINS 'programming foundations with javascript'
MATCH (gitv: Course) WHERE toLower(gitv.name) CONTAINS 'version control with git' AND toLower(gitv.institution) CONTAINS 'atlassian'
MATCH (acss: Course) WHERE toLower(acss.name) CONTAINS 'advanced css concepts'
MATCH (pwjs: Course) WHERE toLower(pwjs.name) CONTAINS 'programming for the web with javascript'
MATCH (feui: Course) WHERE toLower(feui.name) ENDS WITH 'front-end web ui frameworks and tools'
MATCH (reac: Course) WHERE toLower(reac.name) CONTAINS 'front-end web development with react'

// Sam Sequence #2 Courses
MATCH (dbme: Course) WHERE toLower(dbme.name) CONTAINS 'database management essentials'
MATCH (mong: Course) WHERE toLower(mong.name) ENDS WITH 'introduction to mongodb'
MATCH (ssdv: Course) WHERE toLower(ssdv.name) CONTAINS 'server-side development with nodejs, express and mongodb'
MATCH (test: Course) WHERE toLower(test.name) CONTAINS 'software testing' AND toLower(test.institution) CONTAINS 'utah'
MATCH (secu: Course) WHERE toLower(secu.name) CONTAINS 'software security'
MATCH (mobi: Course) WHERE toLower(mobi.name) CONTAINS 'multiplatform mobile app development with react'

MATCH (sam: User { username: 'Sam' })
MATCH (ajay: User { username: 'Ajay' })


// Sam Sequence #1 Relationships
MERGE (st01: PathStart { pathID: '1', name: "Sam Chao's Front End Development" })-[:BELONGS_TO {trackID: '1'}]->(tr01: Track { trackID: '1', name: 'Front End Development' })
MERGE (st01)-[:NEXT {pathID: '1'}]->(pfjs)
MERGE (st01)-[:NEXT {pathID: '1'}]->(gitv)
MERGE (pfjs)-[:NEXT {pathID: '1'}]->(acss)
MERGE (pfjs)-[:NEXT {pathID: '1'}]->(pwjs)
MERGE (gitv)-[:NEXT {pathID: '1'}]->(pwjs)
MERGE (acss)-[:NEXT {pathID: '1'}]->(feui)
MERGE (pwjs)-[:NEXT {pathID: '1'}]->(feui)
MERGE (feui)-[:NEXT {pathID: '1'}]->(reac)
MERGE (feui)-[:NEXT {pathID: '1'}]->(reac)
MERGE (reac)-[:NEXT {pathID: '1'}]->(mobi)
MERGE (mobi)-[:NEXT {pathID: '1'}]->(tr01)
MERGE (sam)-[:CREATED]->(st01)
MERGE (sam)-[:SUBSCRIBED]->(st01)
MERGE (ajay)-[:SUBSCRIBED]->(st01)



// Sam Sequence #2 Relationships
MERGE (st02: PathStart { pathID: '2', name: "Sam Chao's Full Stack Development" })-[:BELONGS_TO {trackID: '2'}]->(tr02: Track { trackID: '2', name: 'Full Stack Development' })
MERGE (st02)-[:NEXT {pathID: '2'}]->(pfjs)
MERGE (st02)-[:NEXT {pathID: '2'}]->(gitv)
MERGE (pfjs)-[:NEXT {pathID: '2'}]->(acss)
MERGE (pfjs)-[:NEXT {pathID: '2'}]->(pwjs)
MERGE (gitv)-[:NEXT {pathID: '2'}]->(pwjs)
MERGE (acss)-[:NEXT {pathID: '2'}]->(feui)
MERGE (pwjs)-[:NEXT {pathID: '2'}]->(feui)
MERGE (feui)-[:NEXT {pathID: '2'}]->(reac)
MERGE (feui)-[:NEXT {pathID: '2'}]->(reac)
MERGE (reac)-[:NEXT {pathID: '2'}]->(mobi)
MERGE (mobi)-[:NEXT {pathID: '2'}]->(dbme)
MERGE (dbme)-[:NEXT {pathID: '2'}]->(mong)
MERGE (mong)-[:NEXT {pathID: '2'}]->(ssdv)
MERGE (ssdv)-[:NEXT {pathID: '2'}]->(test)
MERGE (test)-[:NEXT {pathID: '2'}]->(secu)
MERGE (secu)-[:NEXT {pathID: '2'}]->(tr02)
MERGE (sam)-[:CREATED]->(st02)
MERGE (sam)-[:SUBSCRIBED]->(st02)
MERGE (ajay)-[:SUBSCRIBED]->(st02)
MERGE (sam)-[:IN_PROGRESS]->(pfjs)
MERGE (sam)-[:IN_PROGRESS]->(feui)


// This is a trick to separate commands
WITH count(*) as dummy

//Register Sam's learning style 
MATCH (u:User),(ls:LearningStyle)
WHERE u.userID in ["1","2"] AND ls.learningStyleID = "1"
CREATE (u)-[:LEARNS_BY]->(ls)

// This is a trick to separate commands
WITH count(*) as dummy

// Register Sam's Experience relationships to Skill nodes
MATCH (u:User),(s:Skill)
WHERE u.userID in ["1","2"] AND s.skillID in [ "5","2"]
CREATE (u)-[:EXPERIENCED]->(s)

// This is a trick to separate commands
WITH count(*) as dummy

//Register Sam's Interests relationships to Skill Nodes
MATCH (u:User),(s:Skill)
WHERE u.userID in ["1","2"] AND s.skillID in [ "7","15","18"]
CREATE (u)-[:INTERESTED]->(s)


// RECOMMENDATION ALGO INTEGRATION TEST

// This is a trick to separate commands
WITH count(*) as dummy

// Create a couple fake courses (to see them clearly)
CREATE ( c1: Course {courseID: 'madeupCourse1', name: 'Course A', subject: 'A', tags: ["one"]} )
CREATE ( c2: Course {courseID: 'madeupCourse2', name: 'Course B', subject: 'B', tags: ["two"]} )
CREATE ( c3: Course {courseID: 'madeupCourse3', name: 'Course C', subject: 'C', tags: ["three"]} )
CREATE ( t0: Track {trackID: 'madeupTrack', name: 'Experimental Track' } )

MERGE (c1)-[:NEXT {sequenceID: 'exp1'}]->(c3)
MERGE (c2)-[:NEXT {sequenceID: 'exp2'}]->(c3)
MERGE (c3)-[:NEXT {sequenceID: 'exp3'}]->(t0)

