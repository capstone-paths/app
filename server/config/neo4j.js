/**
 * neo4j.js
 * Sets up neo4j and exports a configured driver
 */
const neo4j = require('neo4j-driver').v1;

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;

const auth = neo4j.auth.basic(user, password);
const driver = neo4j.driver(uri, auth);

module.exports = driver;
