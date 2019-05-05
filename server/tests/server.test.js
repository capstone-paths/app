const expect = require('expect');
const request = require('supertest');
const { app } = require('../index');
const driver = require('../config/neo4j');
const queries = require('./mocks');

const populateDatabase = async () => {
  const s = driver.session();
  await s.run(queries.setInitState);
  s.close();
};

const clearTestData = async () => {
  const s = driver.session();
  await s.run(queries.wipeMockData);
  s.close();
  driver.close();
};

beforeEach(populateDatabase);
afterEach(clearTestData);

describe('GET /api/learning-paths/:id', () => {
  it('should get a learning path', (done) => {
    request(app)
      .get('/api/learning-paths/ST_Path1')
      .set('User', '2')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

  it('should return 400 for non-existing pathIDs', (done) => {
    request(app)
      .get('/api/learning-paths/-1000')
      .set('User', '2')
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  })
});

