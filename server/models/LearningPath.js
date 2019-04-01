const { checkIfAllCoursesExist } = require('./validation/LearningPathValidation');
const ValidationError = require('./validation/ValidationError');
const User = require('./User');
const PathStart = require('./PathStart');

class LearningPath {
  constructor(properties) {
    const { authorID, pathStartData, relationships } = properties;
    this.authorID = authorID;
    this.pathStartData = pathStartData;
    this.relationships = relationships;
  }

  async save(session) {
    const { authorID, pathStartData, relationships } = this;

    const user = await User.findById(session, authorID);
    if (!user) {
      throw new ValidationError(`User does not exist: ${authorID}`);
    }

    await checkIfAllCoursesExist(session, relationships);

    const pathStart = new PathStart(pathStartData);
    await pathStart.validate();
    this.id = pathStart.id;

    const query = `
      MATCH (author: User { userID: {authorID} } )
      CREATE (start: PathStart)
      SET start = {pathStartData}
      CREATE (author)-[:CREATED]->(start)
      WITH author, start
      UNWIND {relationships} AS rel
      MATCH (c1: Course) WHERE c1.courseID = rel.start
      MATCH (c2: Course) WHERE c2.courseID = rel.end
      CREATE (c1)-[:NEXT { pathID: {pathID} }]->(c2)
      RETURN author, start
    `;

    const pathID = this.id;
    await session.run(query, { authorID, pathID, pathStartData, relationships });
    return this;
  }

  static async findById(session, id) {
    const query = `
      MATCH (start: SequenceStart { seqId: toInteger($id) })
      MATCH ()-[rel :NEXT { seqId: toInteger($id) }]->(c: Course)
      MATCH (author: User)-[:CREATED]->(start)
      RETURN author, start, collect(DISTINCT c) AS courses, collect(DISTINCT rel) as rels
    `;

    const results = await session.run(query, { id });
    if (results.records.length === 0) {
      return undefined;
    }

    let startNode, courseNodes, rels;

    let records = results.records[0];

    let authorID = records.get('author').properties.userID.toNumber();

    let start = records.get('start');
    let { name, rating } = start.properties;
    startNode = { nodeId: start.identity.toNumber(), type: 'Start', name, rating };

    courseNodes = records.get('courses').map((course) => {
      let { name, institution } = course.properties;
      return { nodeId: course.identity.toNumber(), type: 'Course', name, institution };
    });

    rels = records.get('rels').map((rel) => {
      let { start, end } = rel;
      return { start: start.toNumber(), end: end.toNumber() };
    });

    return { authorID, startNode, courseNodes, rels };
  }

  toJSON() {
    const { authorID, pathStartData, relationships } = this;
    return { authorID, pathStartData, relationships };
  }
}

module.exports = LearningPath;
