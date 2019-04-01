/**
 * learning-paths
 * Controller handling all learning-path requests
 */
const express = require('express');
const driver = require('../config/neo4j');

const router = express.Router();

const LearningPath = require('../models/LearningPath');


/**
 * @route  GET /api/learning-paths/:id
 * @access Public
 * @desc   Retrieves a learning path by id
 * @param  id (in-path, mandatory, id)
 */
router.get('/:id', (req, res, next) => {
  if (!req.params.id) {
    res.status(400);
  }

  const session = driver.session();
  LearningPath
    .findById(session, req.params.id)
    .then((result) => {
      if (!result) {
        res.status(400);
      }
      res.json(result);
    })
    .catch(next)
});


/**
 * @route    POST /api/learning-paths
 * @access   Private
 * @desc     Saves a learning path
 * @param    data (in-body, mandatory, LearningPath)
 */
router.post('/', (req, res, next) => {
  const { data } = req.body;
  if (!data) {
    res.status(400);
  }

  const session = driver.session();
  const lp = new LearningPath(data);

  lp
    .save(session)
    .then(response => res.json(response))
    .catch(next);
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
    MATCH (c: Course) RETURN c as course, rand() as r order by r limit 1
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
      let courseData = node.properties;

      // We are done, return the results, up to the client to represent them :)
      res.json({ data: { course: courseData }});
    })
    .catch(next)
    .then(() => session.close());
  });

module.exports = router;
