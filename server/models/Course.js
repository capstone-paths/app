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
}

module.exports = Course;
