/**
 * learning-paths
 * Controller handling all learning-path requests
 */
const express = require('express');
const uuid = require('uuid/v4');
const driver = require('../config/neo4j');

const router = express.Router();

const LearningPath = require('../models/learning-path');

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
 * @route    POST /api/learning-paths
 * @access    Private
 * @desc     Saves a learning path
 * @param    data (in-body, mandatory, LearningPath)
 */
router.post('/', (req, res, next) => {
  // 1. create sequence start node
  // 2. create relationship between start node and user node
  // 3. create relationships between all nodes

  const body = {
    startNode: {
      authorID: 3,
      name: 'testSequence008'
    },
    rels: [
      { start: 1, end: 2 },
      { start: 1, end: 3 },
      { start: 2, end: 4 }
    ]
  }

  const { startNode, rels } = body;
  const session = driver.session();

  LearningPath
    .createLearningPath(session, startNode, rels)
    .catch(e => console.log(e));

  // try {
  //   LearningPath.createLearningPath(session, startNode, rels);
  // }
  // catch(e) {
  //   next(e);
  // }
});


module.exports = router;
