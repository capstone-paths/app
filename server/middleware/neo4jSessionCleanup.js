/**
 * If a neo4j session exists, close it
 * Taken from the official Neo4j example:
 * https://github.com/neo4j-examples/neo4j-movies-template/blob/master/api/middlewares/neo4jSessionCleanup.js
 */
module.exports = function neo4jSessionCleanup(req, res, next) {
  res.on('finish', function () {
    if(req.neo4jSession) {
      req.neo4jSession.close();
      delete req.neo4jSession;
    }
  });
  next();
};