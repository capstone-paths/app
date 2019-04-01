/**
 * learning-paths
 * Controller handling all learning-path requests
 */
const express = require('express');
const uuid = require('uuid/v4');
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
  const data = {
    authorID: 3,
    pathStartData: {
      name: 'testSequence012'
    },
    relationships: [
      { start: 1, end: 2 },
      { start: 1, end: 3 },
      { start: 2, end: 4 }
    ]
  }

  const session = driver.session();

  const lp = new LearningPath(data);

  lp
    .save(session)
    .then(response => res.json(response))
    .catch(next);
});


module.exports = router;
