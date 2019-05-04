const expect = require('expect');
const request = require('supertest');
const { app } = require('../index');
const driver = require('../config/neo4j');
const queries = require('./mocks');

const populateDatabase = (done) => {
  const s = driver.session();
  s.run(queries.setInitState);
  s.close();
};

const clearTestData = (done) => {
  const s = driver.session();
  s.run(queries.wipeMockData);
  s.close();
};

beforeEach(populateDatabase);
afterEach(clearTestData);
