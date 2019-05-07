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
 * @desc   Retrieves a user by id
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

  /**
 * @route  GET /api/users/email/:email
 * @access Public
 * @desc   Retrieves a user by email
 * @param  email 
 */
router.get('/email/:email', (req, res, next) => {
    const session = utils.getDBSession(req);
    User
      .findByEmail(session, req.params.email)
      .then((result) => {
        if (!result) {
          res.status(400);
        }
        res.json(result);
      })
      .catch(next)
  });


router.post('/signup', (req, res, next) => {
  console.log('req.body', req.body);

  const user = new User(req.body);
  const session = utils.getDBSession(req);

  user
    .signup(session)
    .then(result => res.status(200).json(user))
    .catch(next);
});

  /**
 * @route  POST /api/users/:id
 * @access Public
 * @desc   Saves a user by id
 * @param  id (in-path, mandatory, id)
 */
router.post('/:id', (req, res, next) => {
  //TODO this needs to be properly secured. 
  if (!req.params.id) {
    res.status(400);
  }

  const session = utils.getDBSession(req);
  User
    .save(session, req.body)
    .then((result) => {
      if (!result) {
        res.status(400);
      }
      res.json(result);
    })
    .catch(next)
});



  module.exports = router;
