/**
 * skills
 * Controller handling all skill requests
 */
const express = require('express');
const utils = require('../utils');
const router = express.Router();
const Skill = require('../models/Skill');


/**
 * @route  GET /api/skills
 * @access Public
 * @desc   Retrieves all skills
 */
router.get('/', (req, res, next) => {
  const session = utils.getDBSession(req);
  Skill
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
