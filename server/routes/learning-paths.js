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
  console.log('GET /api/learning-paths/:id called');
  // const query = 'MATCH (n)-[seq :NEXT {seqId: 1}]->(m) RETURN n, m, seq';
  const query = `
    MATCH path = (c1)-[nextRel: NEXT {seqId: 1}]->(c2)
    WITH DISTINCT(path) AS path
    RETURN nodes(path) AS nodes, relationships(path) as rels
  `;

  const session = driver.session();
  session
    .run(query)
    .then((results) => {
      res.json(results);
    })
    .catch(next)
    .then(() => session.close())
});

module.exports = router;
