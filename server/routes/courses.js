const express = require('express');

const router = express.Router();

/**
 * @route  GET /courses
 * @desc   Returns all nodes in the graph
 * @access Public
 * This is a temporary route - we probably don't want a public route like this
 */
router.get('/', (req, res, next) => {

});

module.exports = router;
