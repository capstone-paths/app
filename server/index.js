require('dotenv').config();
require('./config/index.js');

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const logger = require('./config/winston');

const app = express();

// Compress all responses
app.use(compression());

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static pages from public
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));


// TODO: Point to proper index
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Catch-all error handler
app.use((err, req, res) => {
  logger.error(err.stack);
  res.status(err.status || 500);
  res.json({ err });
});

// Needs to be 8081 due to ElasticBeanstalk nginx default config
const port = 8081;
app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});

module.exports = { app };
