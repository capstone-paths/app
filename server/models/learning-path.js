const uuid = require('uuid/v4');
const Joi  = require('joi');

const User = require('./User');
const LPStartSchema = require('./schema/LPStartSchema');

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