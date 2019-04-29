/**
 * tracks
 * Controller handling track requests
 */
const express = require('express');
const utils = require('../utils');
const router = express.Router();
const Track = require('../models/Track');

/**
 * @route  GET /api/tracks
 * @access Public
 * @desc   Retrieves a list of all track ids and track names
 * @param  trackID (in-path, mandatory, id)
 */
router.get('/', (req, res, next) => {
  const session = utils.getDBSession(req);
  Track
    .getAllTrackNames(session)
    .then(result => {
      if (!result) {
        res.status(400).send({ error: 'No tracks found '});
      }
      res.json(result);
    })
    .catch(next);
});

module.exports = router;
