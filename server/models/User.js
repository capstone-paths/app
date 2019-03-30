/**
 * User
 * Builds a user from a Neo4j user Node
 */
class User {
  constructor(node) {
    const { id, name } = node.properties;
    this.id = id;
    this.name = name;
  }
}

module.exports = User;
