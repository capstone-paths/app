/**
 * neo4j.js
 * Sets up neo4j and exports a configured driver
 */
const neo4j = require('neo4j-driver').v1;
const logger = require('./winston');

//if EBS env variable not available use local
const uri = process.env.PS_NEO4J_BOLT_URL || process.env.NEO4J_URI;
const user = process.env.PS_NEO4J_USER || process.env.NEO4J_USER;
const password = process.env.PS_NEO4J_PWD || process.env.NEO4J_PASSWORD;

const auth = neo4j.auth.basic(user, password);
const driver = neo4j.driver(uri, auth);

// If there was a problem in setup we shouldn't get here
// (App should exit with error)
logger.info(`Neo4j listening on URI: ${uri}`);

module.exports = driver;
