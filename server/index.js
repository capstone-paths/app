// Server .env is expected at server root
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Additional config: database, etc.
require('./config/index.js');

const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const logger = require('./config/winston');
const oauth = require('./models/oauth');
const neo4jSessionCleanup = require('./middleware/neo4jSessionCleanup');

//remove
// logger.info(`Env Variables: ${JSON.stringify(process.env)}`);
// console.log(process.env);


// Import routers
const learningPaths = require('./routes/learning-paths');
const courses = require('./routes/courses');
const users = require('./routes/users');
const skills = require('./routes/skills');
const tracks = require('./routes/tracks');
const learningStyles = require('./routes/learning-styles');
const authREST = require('./routes/auth-rest');




const app = express();

// Compress all responses
app.use(compression());

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(neo4jSessionCleanup);
app.use(oauth.guard);


// Plug in routers
app.use('/api/learning-paths', learningPaths);
app.use('/api/courses', courses);
app.use('/api/users', users);
app.use('/api/skills', skills);
app.use('/api/learning-styles', learningStyles);
app.use('/api/tracks', tracks);
app.use('/auth', authREST);


// Serve static content from React app build
const publicPath = path.join(__dirname, '..', 'client/build');
app.use(express.static(publicPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Catch-all error handler
app.use((err, req, res, next) => {
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
