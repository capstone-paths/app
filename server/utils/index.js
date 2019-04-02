/**
 * utils
 * Various utilities for the server
 */
const driver = require('../config/neo4j');


/**
 * Creates a session from a storage context (normally the request object)
 * Taken from the official Neo4j example:
 * https://github.com/neo4j-examples/neo4j-movies-template/blob/master/api/neo4j/dbUtils.js
 */
exports.getDBSession = function (context) {
  if(context.neo4jSession) {
    return context.neo4jSession;
  }
  else {
    context.neo4jSession = driver.session();
    return context.neo4jSession;
  }
};