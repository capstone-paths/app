const Joi = require('joi');

const LearningPathStartSchema = {
  id: Joi.string().guid(),
  name: Joi.string().alphanum().min(2).max(30).required()
}

/**
 * Validates whether the start node info is correct
 * @param {Object} learningPathStartData The data for the starting node 
 */
const validateStartNode = async (learningPathStartData) => {
  const schema = Joi.object().keys(LearningPathStartSchema);
  const { error } = await Joi.validate(learningPathStartData, schema);
  if (error) {
    throw { status: 400, message: error };
  }
}

/**
 * Checks if all courses in a given relationship exist
 * Important for validating a learning path that is being created
 * @param {Session} session The Neo4j session
 * @param {Array} relationships [{start: courseID, end: courseId}, ...]
 * @returns {Boolean}
 */
const checkIfAllCoursesExist = async (session, relationships) => {
  console.log('check if all courses');
  let courseSet = new Set();
  relationships.forEach(rel => {
    courseSet.add(rel.start);
    courseSet.add(rel.end);
  });
  let courseIDList = [...courseSet];

  let query = `
    UNWIND {courseIDList} AS courseID
    MATCH (c: Course { id: {courseID} })
    RETURN count(c) AS count
  `;

  const res = await session.run(query, { courseIDList });
  return res.get('count').toNumber() === courseIDList.length;
};

module.exports = { validateStartNode, checkIfAllCoursesExist };
