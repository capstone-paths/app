/**
 * learning-paths
 * Controller handling all learning-path requests
 */
const express = require('express');
const driver = require('../config/neo4j');

const router = express.Router();

/**
 * @route  GET /api/learning-paths/:id
 * @access Public
 * @desc   Retrieves a learning path by id
 * @param  id (in-path, mandatory, id)
 */
router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  const query = `
      MATCH (start: SequenceStart {seqId: ${id}})
      MATCH ()-[rel :NEXT {seqId: 1}]->(c: Course)
      RETURN start, collect(DISTINCT c) AS courses, collect(DISTINCT rel) as rels
  `;

  const session = driver.session();
  session
    .run(query)
    .then((results) => {
      if (results.records.length === 0) {
        res.status(404).send(`course id ${id} not found`);
      }

      // Three basic blocks of our response
      let startNode, courseNodes, rels;

      // Results contain an array of records, but we only expect one result
      // Somewhat confusing, has to do with a design relying on Streams
      // For now remember that the first result contains *everything*
      // https://neo4j.com/docs/driver-manual/1.7/cypher-values/#driver-result
      // https://neo4j.com/docs/api/javascript-driver/current/class/src/v1/result.js~Result.html
      let records = results.records[0];

      // We represent the starting node as a distinct response object
      // Alternatively, we could have a single nodes array grouping both 
      // start nodes and course nodes, but we'd need to be aware of this in the client
      // Getting certain fields such as id is a PITA in neo4j - clearly
      // calls for an OGM, whether external or our own
      let start = records.get('start');
      let { name, rating } = start.properties;
      startNode = { nodeId: start.identity.toNumber(), type: 'Start', name, rating };

      // We map course and relationship results to lists of types we can easily
      // work with in the client
      // Again, the jankiness of having to call toNumber() to extract a single
      // Integer type field suggests we might need to use an OGM
      courseNodes = records.get('courses').map((course) => {
        let { name, institution } = course.properties;
        return { nodeId: course.identity.toNumber(), type: 'Course', name, institution };
      });

      rels = records.get('rels').map((rel) => {
        let { start, end } = rel;
        return { start: start.toNumber(), end: end.toNumber() };
      })

      // We are done, return the results, up to the client to represent them :)
      res.json({ data: { startNode, courseNodes, rels }});
    })
    .catch(next)
    .then(() => session.close());
});
/**
 * @route  GET /api/learning-paths/:id/recommendation
 * @access Public
 * @desc   Suggests a new node for the learning path
 * @param  id (in-path, mandatory, id)
 */
router.get('/:id/recommendation', (req, res, next) => {
  const id = req.params.id;

  const query = `
    MATCH (course) where course.institution is not null   RETURN course as course, rand() as r order by r limit 1
  `;

  const session = driver.session();
  session
    .run(query)
    .then((results) => {
      if (results.records.length === 0) {
        res.status(404).send(`course id ${id} not found`);
      }

      let records = results.records[0];
      let node = records.get('course');
      let { name, institution } = node.properties;
      let course =  { nodeId: node.identity.toNumber(), type: 'Course', name, institution };

      // We are done, return the results, up to the client to represent them :)
      res.json({ data: { course }});
    })
    .catch(next)
    .then(() => session.close());
});

module.exports = router;
