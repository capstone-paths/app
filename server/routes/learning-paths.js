// TODO: Remove util
const util = require('util');
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
  const query = `
    MATCH (start: SequenceStart {seqId: 1})
    MATCH ()-[rel :NEXT {seqId: 1}]->(c: Course)
    RETURN start, collect(DISTINCT c), collect(DISTINCT rel) 
  `;


  const session = driver.session();
  session
    .run(query)
    .then((results) => {
      let [nodes, rels] = [[], []];

      // Results contain an array of records, but we only expect one result
      // Somewhat confusing, but it's how it works; references:
      // https://neo4j.com/docs/driver-manual/1.7/cypher-values/#driver-result
      // https://neo4j.com/docs/api/javascript-driver/current/class/src/v1/result.js~Result.html
      let records = results.records[0];

      let start = records.get("start");
      let { name, rating } = start.properties;
      nodes[0] = { nodeId: start.identity.toNumber(), type: "start", name, rating };

      res.json(nodes);
    })
    .catch(next)
    .then(() => session.close())
});

module.exports = router;
