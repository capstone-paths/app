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
 * @param  id (in-path, mandatory, id)
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

module.exports = router;
