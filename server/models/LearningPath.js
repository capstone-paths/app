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
  static async save(session, userID, pathID, name, relationships) {
    // await checkIfAllCoursesExist(session, relationships);

    // const pathStart = new PathStart(pathStartData);
    // await pathStart.validate();
    // this.id = pathStart.id;

    const query = `
      MATCH (author: User { userID: {userID} } )
      MERGE (start: PathStart {pathID: {pathID} })
      SET start.name = {name}
      MERGE (author)-[:CREATED]->(start)
      WITH author, start
      UNWIND {relationships} AS rel
      MATCH (c1: Course) WHERE c1.courseID = rel.start
      MATCH (c2: Course) WHERE c2.courseID = rel.end
      MERGE (c1)-[:NEXT { pathID: {pathID} }]->(c2)
      RETURN author, start
    `;

    await session.run(query, { userID, pathID, name, relationships });
    return true;
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
    MATCH (p1:User {userID: $userId})-[:EXPERIENCED]->(skill1)
    WITH p1, collect(id(skill1)) AS p1Skill
    MATCH (p2:User)-[:EXPERIENCED]->(skill2)
    WHERE p2.userID <> p1.userID
    WITH p1, p1Skill, p2, collect(id(skill2)) AS p2Skill
    WHERE algo.similarity.jaccard(p1Skill, p2Skill) > $similarityThreshold 
    MATCH (p2)-[:SUBSCRIBED]->(paths: PathStart)
    MATCH (course: Course {courseID : $courseId})-[:NEXT{pathID: paths.pathID}]->(nextCourse)
    RETURN PROPERTIES(nextCourse) as course,
           count(course)
    ORDER BY count(course) desc
    LIMIT 3
    `;
    let similarityThreshold = .25;
    const results = await session.run(query, { courseId, userId, similarityThreshold });
    if (results.records.length === 0) {
      return undefined;
    }
    return results.records.map(r => r.get('course'));
  }

  /**
   * Obtains a system-wide recommendation for a given track
   * Calls the custom Neo4j procedure and returns the results
   * @param {Session} session Neo4j session context
   * @param {uuid} trackID The track for which to obtain the recommendation 
   */
  static async getSystemRecommendation(session, trackID) {
    const query = `
    MATCH (t: Track) WHERE t.trackID=$trackID
    CALL lernt.findCoursePath(t, {})
    YIELD nodes, relationships
    RETURN nodes, relationships
    `

    const results = await session.run(query, { trackID });
    if (results.records.length === 0) {
      return undefined;
    }

    let sequence, nodes, rels;

    let records = results.records[0];

    // It would be much cleaner to do all this filtering and mapping
    // directly in the Cypher query; however, (probably) due to the usage of
    // VirtualNodes in the custom procedures, regular Cypher filter
    // functions do not seem to work properly, so have to do it in code

    sequence = records
      .get('nodes')
      .filter(n => n.labels.includes('PathStart'))
      .map(n => n.properties);

    nodes = records
      .get('nodes')
      .filter(n => n.labels.includes('Course'))
      .map(n => n.properties);


    rels = records
      .get('relationships')
      .map(rel => ({
        start: rel.properties.originalStartID.toNumber(),
        end: rel.properties.originalEndID.toNumber()
      }));

    return { sequence, nodes, rels };
  }

  // TODO: Need to think about this
  toJSON() {
    const { authorID, pathStartData, relationships } = this;
    return { authorID, pathStartData, relationships };
  }


}

module.exports = LearningPath;
