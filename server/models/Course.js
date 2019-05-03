class Course {
  /**
   * Finds all courses
   * @param {Session} session 
   */
  static async findAll(session) {
    const query = `
      MATCH (c: Course)
      RETURN c 
    `;

    const results = await session.run(query);
    if (results.records.length === 0) {
      return undefined;
    }

    let courseData = results.records.map((course) => {
      return course.get("c").properties;
    });
    
    return { 
      courses: courseData
    };
  }
    /**
   * Finds a course by id
   * @param {Session} session 
   * @param {Integer} courseId 
   */
  static async findById(session, courseId, userId) {
    const query = `
    MATCH (c: Course {courseID: $courseId})
    OPTIONAL MATCH (user: User{userID: $userId})-[completed :COMPLETED]->(c)
      with c, count(completed) as completed
    OPTIONAL MATCH (user: User{userID: $userId})-[inProgress :IN_PROGRESS]->(c)
    RETURN apoc.map.merge(
      PROPERTIES(c),
        {
          status: CASE
                    WHEN count(inProgress) >= 1 THEN 'inprogress'
                    WHEN completed >= 1 THEN 'complete'
                    ELSE 'unstarted' END
        }
      ) as course`;

    const results = await session.run(query, { courseId, userId });
    if (results.records.length === 0) {
      return undefined;
    }


    // TODO: Create a generic serialization layer that does this
    // It should be able to pull it from a schema and do it for any object
    let courseNodes, rels;

    let records = results.records[0];

    let course = records.get('course');
    return course;
  }


  static async updateCourseStatus(session, courseId, userId, status) {
    if(status == 'inprogress'){
      status = 'IN_PROGRESS';
    }else if(statys =='completed'){
      status = 'COMPLETED';
    }else{
      throw 'unexpected status';
    }
    const query = `
    MATCH (u: User {userID: $userId})
    MATCH (c: Course {courseID: $courseId})
    MERGE (u)-[:`+status+`]->(c)`
    await session.run(query, { courseId, userId });
    return true;
  }
}

module.exports = Course;
