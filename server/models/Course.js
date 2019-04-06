class Course {
  /**
   * Finds all courses
   * @param {Session} session 
   * @param {Integer} id 
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
   * @param {Integer} id 
   */
  static async findById(session, id) {
    const query = `
    MATCH (c: Course {courseID: $id})
    RETURN c as course`;
    const results = await session.run(query, { id });
    if (results.records.length === 0) {
      return undefined;
    }


    // TODO: Create a generic serialization layer that does this
    // It should be able to pull it from a schema and do it for any object
    let courseNodes, rels;

    let records = results.records[0];

    let course = records.get('course');
    let courseData = course.properties;
    return {
      course : courseData
    };
  }
}

module.exports = Course;
