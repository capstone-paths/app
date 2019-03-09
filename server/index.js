require('./config/index.js');

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');

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

// Catch-all error handlers
// Do not print stack trace in production
if (process.env.NODE_ENV !== 'production') {
  app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(err.status || 500);
    res.json(err);
  });
}

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = { app }