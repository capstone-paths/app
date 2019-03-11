const neo4j = require('neo4j-driver').v1;

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;

// const auth = neo4j.auth.basic(user, password);
// const driver = neo4j.driver(uri, auth);
console.log(`uri: ${uri}, user: ${user}, password: ${password}`);

// module.exports = driver;
