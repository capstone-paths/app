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

  static async findById(session, userID) {
    const query = 'MATCH (user: User { userID: {userID} }) RETURN user';
    // TODO: Think of an abstraction layer to get properties easily
    // This is going to get tiring quickly
    const results = await session.run(query, { userID });
    const records = results.records;
    if (records.length === 0) {
      return undefined;
    }
    return new User(records[0].get('user'));
  }
}

module.exports = User;
