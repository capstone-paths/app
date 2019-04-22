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


  /**
   * Saves a LearningPath to the database
   * @param {Session} session 
   */
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

  /**
    * Finds all paths
    * @param {Session} session 
    */
  static async findAll(session) {
    const query = `
      MATCH (s: PathStart)
      RETURN s 
    `;

    const results = await session.run(query);
    if (results.records.length === 0) {
      return undefined;
    }

    let sequenceData = results.records.map((sequence) => {
      return sequence.get("s").properties;
    });

    return {
      sequences: sequenceData
    };
  }
  /**
   * Finds a sequence by id
   * @param {Session} session 
   * @param {Integer} id 
   */
  static async findById(session, id) {
    const query = `
      MATCH (s: PathStart {pathID: $id})
      MATCH ()-[rel :NEXT {pathID: $id}]->(c: Course)
      WITH { 
        sequence : PROPERTIES(s),
        courseNodes : COLLECT(DISTINCT(PROPERTIES(c))),
        rels : COLLECT(DISTINCT ({start : startNode(rel).courseID, end: endNode(rel).courseID }))
      } as sequenceData
      RETURN sequenceData
    `;

    const results = await session.run(query, { id });
    if (results.records.length === 0) {
      return undefined;
    }

    let records = results.records[0];
    return records.get('sequenceData');
  }

  /**
    * subscribe to a sequence by id
    * @param {Session} session 
    * @param {Integer} sequenceID 
    * @param {Integer} userID 
   */
  static async toggleSubscribe(session, sequenceID, userID) {
    let isSubscribed = await this.isSubscribed(session, sequenceID, userID);
    let query = '';
    if (isSubscribed) {
      query = `
      MATCH (u: User {userID: $userID})-[r:SUBSCRIBED]->(ps: PathStart {pathID: $sequenceID})
      DELETE r
    `;
    }
    else {
      query = `
      MATCH (u: User {userID: $userID})
      MATCH (ps: PathStart {pathID: $sequenceID})
      MERGE (u)-[:SUBSCRIBED]->(ps)
    `;
    }
    await session.run(query, { userID, sequenceID });
    return await this.isSubscribed(session, sequenceID, userID);
  }
  /**
     * Returns whether the sequence is already subscribed to by the user or not 
     * 
     * @param {Session} session 
     * @param {Integer} sequenceID 
     * @param {Integer} userID 
    */
  static async isSubscribed(session, sequenceID, userID) {
    const query = `
    MATCH  (u:User {userID: $userID}), (ps:PathStart {pathID: $sequenceID}) 
    RETURN EXISTS( (u)-[:SUBSCRIBED]-(ps) ) 
    `;

    const results = await session.run(query, { userID, sequenceID });
    if (results.records.length === 0) {
      return undefined;
    }

    return results.records[0].get(0);
  }
  /**
     * Finds a course by id
     * @param {Session} session 
     * @param {Integer} id 
     */
  static async findRecommendations(session, userId, sequenceId, courseId) {
    //todo expand on this. This is a most popular search
    const query = `
    MATCH (c: Course {courseID : $courseId})-[:NEXT]->(nextC)
    RETURN PROPERTIES(nextC) as course, count(c)
    ORDER BY count(c) desc
    LIMIT 3
    `;
    const results = await session.run(query, { courseId });
    if (results.records.length === 0) {
      return undefined;
    }

    return results.records.map(r => r.get('course'));
  }
  // TODO: Need to think about this
  toJSON() {
    const { authorID, pathStartData, relationships } = this;
    return { authorID, pathStartData, relationships };
  }
}

module.exports = LearningPath;
