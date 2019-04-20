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
      RETURN s as sequence, collect(DISTINCT c) AS courses,COLLECT(distinct [startNode(rel).courseID, endNode(rel).courseID]) as rels
    `;

    const results = await session.run(query, { id });
    if (results.records.length === 0) {
      return undefined;
    }


    // TODO: Create a generic serialization layer that does this
    // It should be able to pull it from a schema and do it for any object
    let courseNodes, rels;

    let records = results.records[0];

    let sequence = records.get('sequence');
    let sequenceData = sequence.properties;

    courseNodes = records.get('courses').map((course) => {
      return course.properties
    });

    rels = records.get('rels').map((rel) => {
      return { start: rel[0], end: rel[1] };
    });

    return { 
      sequence: sequenceData,
      courseNodes, 
      rels 
    };
  }

  /**
   * Obtains a system-wide recommendation for a given track
   * Calls the custom Neo4j procedure and returns the results
   * @param {Session} session Neo4j session context
   * @param {uuid} trackID The track for which to obtain the recommendation 
   */
  static async getSystemRecommendation(session, id) {
    const query = `
    MATCH (t: Track) WHERE t.trackID=$trackID
    CALL lernt.findCoursePath(t, {})
    YIELD nodes, relationships
    RETURN nodes, relationships
    `

    const results = await session.run(query, { id });
    if (results.records.length === 0) {
      return undefined;
    }

    let nodes, rels;

    let records = results.records[0];

    nodes = records.get('courses').map((course) => {
      return course.properties
    });

    rels = records.get('rels').map((rel) => {
      // map start originalID and end originalID
    });

    // TODO: Need to do something about the path start
    return { nodes, rels };
  }
  

  // TODO: Need to think about this
  toJSON() {
    const { authorID, pathStartData, relationships } = this;
    return { authorID, pathStartData, relationships };
  }


}

module.exports = LearningPath;
