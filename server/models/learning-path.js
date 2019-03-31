const uuid = require('uuid/v4');
const Joi  = require('joi');

const User = require('./user');
const LPStartSchema = require('./schema/LPStartSchema');

/**
 * Checks if all courses in a given relationship exist
 * Important for validating a learning path that is being created
 * @param {Session} session The Neo4j session
 * @param {Array} relationships [{start: courseID, end: courseId}, ...]
 * @returns {Boolean}
 */
exports.checkIfAllCoursesExist = async (session, relationships) => {
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


exports.createLearningPath = async (session, learningPathStartData, relationships) => {
  // Give the sequence an id
  const learningPathID = uuid();
  learningPathStartData.id = learningPathID;

  console.log('validate');
  const { error } = await Joi.validate(learningPathStartData, LPStartSchema);
  if (error) {
    throw { status: 400, message: error };
  }

  console.log('findById');
  const found = await User.findById(session, learningPathStartData.authorID);
  if (!found) {
    throw { status: 400, message: 'Could not find user' };
  }

  if (!(await checkIfAllCoursesExist(session, relationships))) {
    throw { status: 400, message: 'Could not find courses' };

  }

  const query = `
    MATCH (author: User { userID: {authorID} } )
    CREATE (start: SequenceStart { seqId: {learningPathID}, name: {name} } )
    CREATE (author)-[:CREATED]->(start)
    WITH author, start
    UNWIND {rels} AS rel
    MATCH (c1: Course) WHERE c1.courseID = rel.start
    MATCH (c2: Course) WHERE c2.courseID = rel.end
    CREATE (c1)-[:NEXT { seqId: {seqId} }]->(c2)
    RETURN author, start
  `;

  const { authorID, name } = learningPathStartData;

  const result = await session.run(query, { authorID, name });
  return result;
};