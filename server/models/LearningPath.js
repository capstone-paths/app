const { checkIfAllCoursesExist } = require('./validation/LearningPathValidation');
const ValidationError = require('./validation/ValidationError');
const User = require('./User');
const PathStart = require('./PathStart');
const uuidv1 = require('uuid/v1');

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
    await checkIfAllCoursesExist(session, relationships);


    // TODO: Not sure if this makes sense at the model layer. Commenting out for now  
    // const pathStart = new PathStart(pathStartData);
    // await pathStart.validate();

    let firstNext = relationships.find(r => r.start == undefined).end

    const query = `
      OPTIONAL MATCH (c: Course)-[oldR:NEXT { pathID: {pathID} }]->() DELETE oldR WITH oldR
      MATCH (author: User { userID: {userID} } )
      MERGE (start: PathStart {pathID: {pathID} })
      SET start.name = {name}
      MERGE (author)-[:CREATED]->(start) 
      MERGE (author)-[:SUBSCRIBED]->(start) 
      WITH start, author 
      MATCH(firstCourse: Course {courseID: {firstNext}})
      MERGE (start)-[:NEXT { pathID: {pathID} }]->(firstCourse)
      WITH author, start
      UNWIND {relationships} AS rel
      MATCH (c1: Course) WHERE c1.courseID = rel.start
      MATCH (c2: Course) WHERE c2.courseID = rel.end
      MERGE (c1)-[:NEXT { pathID: {pathID} }]->(c2)
      RETURN author, start
    `;
    
    if(pathID === null){
      pathID = uuidv1()
    }
    await session.run(query, { userID, pathID, name, relationships, firstNext });
    return this.findById(session, pathID, userID);
  }


  static async remix(session, userID, pathID, relationships) {
    await checkIfAllCoursesExist(session, relationships);
    let newPathID =  uuidv1();
    const getOldNameQuery = `
      MATCH(u: User {userID:$userID})
      OPTIONAL MATCH(ps: PathStart {pathID:$pathID})
      return ps.name as pathName, u.username as userName
    ` 
    let result = await session.run(getOldNameQuery, { pathID, userID});
    let record = result.records[0];
    let name = record.get('userName') + '\'s remix: ' + (record.get('pathName') !== null ?  record.get('pathName') : '');
    let path = this.save(session, userID, newPathID, name, relationships)
 
    if(pathID !== null){
      const query = `
        MERGE (newPath :PathStart{pathID: $newPathID})-[r :REMIXED]->(original :PathStart{pathID: $pathID})
        return *
      `
      
      await session.run(query, { pathID, newPathID});
    }
    return path;
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
  static async findById(session, id, userId) {
    const query = `
      MATCH (s: PathStart {pathID: $id})
      MATCH ()-[rel :NEXT {pathID: $id}]->(c: Course)
      OPTIONAL MATCH (user: User{userID: $userId})-[created :CREATED]->(s)
      OPTIONAL MATCH (user: User{userID: $userId})-[completed :COMPLETED]->(c)
      with s, rel, c, count(completed) as completed, count(created) as created
      OPTIONAL MATCH (user: User{userID: $userId})-[inProgress :IN_PROGRESS]->(c)
      WITH apoc.map.merge(
        PROPERTIES(c),
          {
            status: CASE
                      WHEN completed >= 1 THEN 'completed'
                      WHEN count(inProgress) >= 1 THEN 'inprogress'
                      ELSE 'unstarted' END
          }
        ) as course,
        apoc.map.merge(
          PROPERTIES(s),
          {
            owner: CASE WHEN created >=1 THEN true ELSE false END
          }
        ) as sequence, rel
      RETURN { 
          sequence : sequence,
          courseNodes : COLLECT(DISTINCT(
            course
            )),
          rels : COLLECT(DISTINCT ({start : startNode(rel).courseID, end: endNode(rel).courseID }))
        } as sequenceData
      
    `;

    console.log('findById model, about to execute query, id: ', id);
    const results = await session.run(query, { id, userId });
    if (results.records.length === 0) {
      return undefined;
    }

    let records = results.records[0];
    console.log('findById model, return results, id: ', id);
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
  static async findRecommendations(session, userId, pathId, courseId) {
    const similarQuery = `
    MATCH (p1:User {userID: $userId})-[:EXPERIENCED]->(skill1)
    WITH p1, collect(id(skill1)) AS p1Skill
    MATCH (p2:User)-[:EXPERIENCED]->(skill2)
    WHERE p2.userID <> p1.userID
    WITH p1, p1Skill, p2, collect(id(skill2)) AS p2Skill
    WHERE algo.similarity.jaccard(p1Skill, p2Skill) > $similarityThreshold 
    MATCH (p2)-[:SUBSCRIBED]->(paths: PathStart)
    MATCH (course: Course {courseID : $courseId})-[:NEXT{pathID: paths.pathID}]->(nextCourse: Course)
    WHERE NOT exists(()-[:NEXT{pathID : $pathId}]->(nextCourse))
    WITH PROPERTIES(nextCourse) as nextCourse,
           count(course) as similarCount
    RETURN nextCourse, similarCount
    ORDER BY similarCount desc
    LIMIT 3
    `;
    let similarityThreshold = .25;
    const similarResults = await session.run(similarQuery, { courseId, userId, pathId, similarityThreshold });

    var courses = similarResults.records.map(r => r.get('nextCourse'));

    const popularQuery = `
    MATCH (course: Course {courseID : $courseId})-[next :NEXT]->(nextCourse: Course)
    WHERE NOT exists(()-[:NEXT{pathID : $pathId}]->(nextCourse))
    WITH PROPERTIES(nextCourse) as nextCourse,
           count(course) as count
    RETURN nextCourse, count
    ORDER BY count desc
    LIMIT 3
    `;

    const popularResults =  await session.run(popularQuery, { courseId, pathId });
    courses.push(...popularResults.records.map(r=>r.get('nextCourse')));
    var unique = new Set(courses.map(item => item.courseID));
    courses = courses.filter(course => { 
      var keep = unique.has(course.courseID);
      unique.delete(course.courseID)
      return keep;
    });
    return courses.slice(0,3);
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
      CALL lernt.findCoursePath(t, { frequencyThreshold: 0.71 })
      YIELD nodes, relationships
      RETURN nodes, relationships
    `;

    const results = await session.run(query, { trackID });
    if (results.records.length === 0) {
      return undefined;
    }
    let records = results.records[0];

    // It would be much cleaner to do all this filtering and mapping
    // directly in the Cypher query; however, (probably) due to the usage of
    // VirtualNodes in the custom procedures, regular Cypher filter
    // functions do not seem to work properly, so have to do it in code

    let sequence = records
      .get('nodes')
      .filter(n => n.labels.includes('PathStart'))
      .map(n => n.properties);

    let courseNodes = records
      .get('nodes')
      .filter(n => n.labels.includes('Course'))
      .map(n => n.properties);


    let rels = records
      .get('relationships')
      // .filter(r => r.properties.originalEndId !== '-1')
      .map(rel => {
        const { originalStartID, originalEndID } = rel.properties;
        return {
          start: originalStartID,
          end: originalEndID,

        }
      });

    return { sequence, courseNodes, rels };
  }


  /**
   * Fetches a list of all paths made by users for a given track;
   * does not return entire learning paths, but rather useful metadata
   * such as author id and name, path name, etc.
   * @param {Session} session Neo4j session context
   * @param {uuid} trackID The track for which to get path data
   */
  static async getPathDataByTrackID(session, trackID) {
    const query = `
      MATCH (t: Track { trackID: $trackID })<-[:BELONGS_TO]-(p: PathStart)
      MATCH (u: User)-[:CREATED]->(p)
       WITH { 
        userID: u.userID,
        userName: u.username,
        pathID: p.pathID, 
        pathName: p.name 
      } AS pathData
      RETURN pathData
    `;

    const results = await session.run(query, { trackID });

    if (results.records.length === 0)  {
      return undefined;
    }

    return results.records.map(result => result.get('pathData'));
  }
}

module.exports = LearningPath;
