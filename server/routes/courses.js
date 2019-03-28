const express = require('express');
const driver = require('../config/neo4j');

const router = express.Router();

/**
 * @route  GET /courses
 * @desc   Returns all nodes in the graph
 * @access Public
 * This is a temporary route - we probably don't want a public route like this
 */
router.get('/learning-paths/:id', (req, res, next) => {
  res.send("Hello world!");
});

module.exports = router;