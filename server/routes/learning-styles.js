/**
 * learning-styles
 * Controller handling all learning style requests
 */
const express = require('express');
const utils = require('../utils');
const router = express.Router();
const LearningStyle = require('../models/LearningStyle');


/**
 * @route  GET /api/learning-styles
 * @access Public
 * @desc   Retrieves all skills
 */
router.get('/', (req, res, next) => {
  const session = utils.getDBSession(req);
  LearningStyle
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
