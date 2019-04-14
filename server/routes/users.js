/**
 * learning-paths
 * Controller handling all learning-path requests
 */

const express = require('express');
const utils = require('../utils');
const router = express.Router();
const User = require('../models/User');

/**
 * @route  GET /api/users/
 * @access Public
 * @desc   Retrieves all user information
 * @param  id (in-path, mandatory, id)
 */
router.get('/', (req, res, next) => {
    //TODO this needs to be properly secured. 
    if (!req.params.id) {
      res.status(400);
    }
  
    const session = utils.getDBSession(req);
    User
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
 * @route  GET /api/users/:id
 * @access Public
 * @desc   Retrieves a learning path by id
 * @param  id (in-path, mandatory, id)
 */
router.get('/:id', (req, res, next) => {
    //TODO this needs to be properly secured. 
    if (!req.params.id) {
      res.status(400);
    }
  
    const session = utils.getDBSession(req);
    User
      .findById(session, req.params.id)
      .then((result) => {
        if (!result) {
          res.status(400);
        }
        res.json(result);
      })
      .catch(next)
  });

  module.exports = router;
