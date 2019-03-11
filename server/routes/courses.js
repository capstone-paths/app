const express = require('express');
const driver = require('../config/neo4j');

const router = express.Router();

/**
 * @route  GET /courses
 * @desc   Returns all nodes in the graph
 * @access Public
 * This is a temporary route - we probably don't want a public route like this
 */
router.get('/', (req, res, next) => {
  const query = `
  MATCH (c1:Course)<-[:REQUIRED_BY]-(c2:Course)
  RETURN c1.name AS course, collect(c2.name) AS prereqs
  `;

  const session = driver.session();
  session
    .run(query)
    .then((results) => {
      session.close();
      const [nodes, rels] = [[], []];
      let i = 0;
      results.records.forEach((result) => {
        nodes.push({ course: result.get('course'), label: 'course' });
        const target = i;
        i++;

        result.get('prereqs').forEach((prereqName) => {
          const prereq = { course: prereqName, label: 'course' };
          let source = nodes.findIndex(elt => elt === prereqName);
          if (source === -1) {
            nodes.push(prereq);
            source = i;
            i++;
          }
          rels.push({ source, target });
        });

        return res.json({ data: { nodes, rels } });
      });
    })
    .catch(next)
    .then(() => session.close());
});

module.exports = router;
