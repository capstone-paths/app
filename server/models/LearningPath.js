class LearningPath {
  constructor(session, properties) {
    const { authorID, startData, relationships } = properties;
  }

  validate() {
    // check that author exists
    // check that startnode info is OK
    // check that all courses mentioned by relationships are OK
  }

  save() {
    // validate
    // run cypher query
    // return result
    // super(query)
  }

  // static
  static async findById(id) {
    // run cypher query
  }
}






