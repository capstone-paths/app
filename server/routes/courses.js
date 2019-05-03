/**
 * courses
 * Controller handling all course requests
 */
const express = require('express');
const utils = require('../utils');
const router = express.Router();
const Course = require('../models/Course');


/**
 * @route  GET /api/courses
 * @access Public
 * @desc   Retrieves all courses
 */
router.get('/', (req, res, next) => {
  const session = utils.getDBSession(req);
  Course
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
 * @route  GET /api/courses/:id/:userId
 * @access Public
 * @desc   Retrieves a course by id
 * @param  id (in-path, mandatory, id)
 */
router.get('/:id/:userId', (req, res, next) => {
  if (!req.params.id) {
    res.status(400);
  }

  const session = utils.getDBSession(req);
  Course
    .findById(session, req.params.id, req.params.userId)
    .then((result) => {
      if (!result) {
        res.status(400);
      }
      res.json(result);
    })
    .catch(next)
});

//update course status
router.post('/:id/:userId/:status', (req, res, next) => {
  if (!req.params.id) {
    res.status(400);
  }

  const session = utils.getDBSession(req);
  Course
    .updateCourseStatus(session, req.params.id, req.params.userId, req.params.status)
    .then((result) => {
      if (!result) {
        res.status(400);
      }
      res.json(result);
    })
    .catch(next)
});


module.exports = router;
