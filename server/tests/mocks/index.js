module.exports.setInitState = `
  CREATE (t001 :Track :TestNode { trackID: 'ST_Track1', name: 'ST_Track1' }) 
  CREATE (c001 :Course :TestNode { courseID: 'ST_Course1', name: 'ST_Course1', subject: 'TestCat', category: 'TestCat', tags: ['one', 'two'] })
  CREATE (p001 :PathStart :TestNode { pathID: 'ST_Path1', name: 'ST_Path1' })
  
  CREATE 
    (p001)-[:NEXT { pathID: 'ST_Path1' }]->(c001),
    (c001)-[:NEXT { pathID: 'ST_Path1' }]->(t001)
`;

module.exports.wipeMockData = `
  MATCH (n: TestNode)
  DETACH DELETE n
`;