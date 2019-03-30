const User = require('./neo4j/User');

exports.findById = async (session, userID) => {
  const query = 'MATCH (user: User { id: userID }) RETURN user';
  const result = await session.run(query, { userID });
  if (result.length === 0) {
    return undefined;
  }
  return new User(result.get('user'));
};