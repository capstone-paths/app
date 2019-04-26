/**
 * learning-paths
 * Controller handling all learning-path requests
 */
const express = require('express');
const utils = require('../utils');
const router = express.Router();
const LearningPath = require('../models/LearningPath');

/**
 * @route  GET /api/sequences
 * @access Public
 * @desc   Retrieves all sequences
 * @param  id (in-path, mandatory, id)
 */
router.get('/', (req, res, next) => {
  const session = utils.getDBSession(req);
  LearningPath
    .findAll(session)
    .then((result) => {
      if (!result) {
        res.status(400);
      }
      res.json(result);
    })
    .catch(next)
});

/**
 * @route  GET /api/learning-paths/:id
 * @access Public
 * @desc   Retrieves a learning path by id
 * @param  id (in-path, mandatory, id)
 */
router.get('/:id', (req, res, next) => {
  console.log('learning-paths called, id: ', req.params.id);

  if (!req.params.id) {
    res.status(400);
  }

  const session = utils.getDBSession(req);
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
 * @route  GET /api/learning-paths/subscribe/:sequenceID/:userID
 * @access Private
 * @desc   Retrieves whether a learning path is subscribed to by user id
 * @param  id (in-path, mandatory, id)
 */
router.get('/is-subscribed/:sequenceID/:userID', (req, res, next) => {
  if ((!req.params.sequenceID) || (!req.params.userID)) {
    res.status(400);
  }

  const session = utils.getDBSession(req);
  LearningPath
    .isSubscribed(session, req.params.sequenceID, req.params.userID)
    .then((result) => {
      res.json(result);
    })
    .catch(next)
});
/**
 * @route  POST /toggle-subscribe/:sequenceID/:userID
 * @access Private
 * @desc   Subscribes or unsubscribes from the sequence
 * @param  id (in-path, mandatory, id)
 */
router.post('/toggle-subscribe/:sequenceID/:userID', (req, res, next) => {
  if ((!req.params.sequenceID) || (!req.params.userID)) {
    res.status(400);
  }

  const session = utils.getDBSession(req);
  LearningPath
    .toggleSubscribe(session, req.params.sequenceID, req.params.userID)
    .then((result) => {
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

  const session = utils.getDBSession(req);
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
router.get('/recommendations/:sequenceID/:userID/:courseID', (req, res, next) => {
  if ((!req.params.sequenceID) || (!req.params.userID)) {
    res.status(400);
  }

  const session = utils.getDBSession(req);
  LearningPath
    .findRecommendations(session,  req.params.userID, req.params.sequenceID, req.params.courseID)
    .then((result) => {
      res.json(result);
    })
    .catch(next)
});


/**
 * @route  GET /api/learning-paths/:id/recommendation
 * @access Public
 * @desc   Returns system-wide recommendation for a given track
 *         (Invokes Neo4j custom procedure)
 * @param  trackID (in-path, mandatory, id)
 */
router.get('/system-recommendation/:id', (req, res, next) => {
  // get the track id
  // invoke the custom procedure
  const { id } = req.params;
  console.log('system-recommendation called, id: ', id);
  if (!id) {
    res.status(400).send({ error: 'missing id' });
  }

  const session = utils.getDBSession(req);

  LearningPath
    .getSystemRecommendation(session, id)
    .then((result) => {
      if (!result) {
        res.status(400).send({ error: `No recommendations for id: ${id}` });
      } 

      res.json(result);
    })
    .catch(next);
});

module.exports = router;
