class User {
  constructor(properties) {
    const { id, name } = properties;
    this.id = id;
    this.name = name;
  }

  static async findAll(session) {
    const query = 'MATCH (user: User) RETURN user';
    const results = await session.run(query, {});
    const records = results.records;
    if (records.length === 0) {
      return undefined;
    }
    var users = records.map (r => r.get('user').properties)
    return users;
  }

  static async findById(session, id) {
    const query = `
    MATCH (u: User {userID: $id})
    MATCH ()-[:INTERESTED]->(interested_skills: Skill)
    MATCH ()-[:EXPERIENCED]->(experienced_skills: Skill)
    MATCH ()-[:LEARNS_BY]->(learning_style: LearningStyle)
    RETURN u as user, collect(DISTINCT interested_skills) AS interested_skills, collect(DISTINCT experienced_skills) AS experienced_skills, collect(DISTINCT learning_style) AS learning_style`;
    // TODO: Think of an abstraction layer to get properties easily
    // This is going to get tiring quickly
    const results = await session.run(query, { id });
    const records = results.records;
    if (records.length === 0) {
      return undefined;
    }
    let result = records[0];
    var user = result.get('user').properties;
    user.interest = records[0].get('interested_skills').map((s) => s.properties);
    user.experience = records[0].get('experienced_skills').map((s) => s.properties);
    user.learningType = records[0].get('learning_style').map((s) => s.properties);

    return user;
  }
}

module.exports = User;
