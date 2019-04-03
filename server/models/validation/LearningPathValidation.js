const Joi = require('joi');

const ValidationError = require('./ValidationError');

/**
 * Checks if all courses in a given relationship exist
 * Important for validating a learning path that is being created
 * @param {Session} session The Neo4j session
 * @param {Array} relationships [{start: courseID, end: courseId}, ...]
 * @returns {Boolean}
 */
const checkIfAllCoursesExist = async (session, relationships) => {
  console.log('checkIfAllCoursesExist');
  let courseSet = new Set();
  relationships.forEach(rel => {
    courseSet.add(rel.start);
    courseSet.add(rel.end);
  });
  let courseIDList = [...courseSet];

  let query = `
    UNWIND {courseIDList} AS courseID
    MATCH (c: Course { courseID: courseID })
    WITH collect(c.courseID) AS hits
    RETURN [x in {courseIDList} WHERE not(x in hits)] as missing
  `;

  const res = await session.run(query, { courseIDList });
  const records = res.records;
  let missing = records[0].get('missing');
  if (missing.length > 0) {
    throw new ValidationError(`Some course IDs do not exist: ${ids}`);
  }
};

module.exports = { checkIfAllCoursesExist };
