const express = require('express');

const router = express.Router();

/**
 * @route  GET /api/learning-paths/:id
 * @access Public
 * @desc   Retrieves a learning path by id
 * @param  id (in-path, mandatory, id)
 */
router.get('/:id', (req, res) => {
  res.send('Hello world!');
});

module.exports = router;
