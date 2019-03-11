/**
 * config/index.js
 * Sets up ports and MongoDB URIs for local / test modes
 * TODO: 
 * setting NODE_ENV is a Heroku thing
 * check if AWS also works like this
 */
const env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  process.env.PORT = 3000;
} else if (env === 'test') {
  process.env.PORT = 3000;
}
