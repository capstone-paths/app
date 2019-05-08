const ValidationError = require('./validation/ValidationError');
const uuid = require('uuid/v4');

class User {
  constructor(userData) {
    const { userID, firstname, lastname, username, email, bio } = userData;
    // User id can be provided on creation or can be provided
    this.userID = userID || uuid();
    this.firstname = firstname;
    this.lastname = lastname;
    this.username = username;
    this.email = email;
    this.bio = bio;
  }

  async signup(session) {
    const { userID, firstname, lastname, username, email, bio } = this;

    const idValidQuery = 'MATCH (u: User { userID: $userID }) RETURN u';
    const idValid = await session.run(idValidQuery, { userID });
    if (idValid.records.length > 0) {
      throw new ValidationError('User validation error: id exists: ', userID);
    }

    const saveQuery = `
      CREATE (:User { userID: $userID, email: $email, firstname: $firstname, 
                      username: $username, lastname: $lastname, bio: $bio })
    `;

    await session.run(saveQuery, { userID, firstname, lastname,
                                   username, email, bio });
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
    WITH u
    OPTIONAL MATCH (u)-[:INTERESTED]->(interested_skills: Skill)
    OPTIONAL MATCH (u)-[:EXPERIENCED]->(experienced_skills: Skill)
    OPTIONAL MATCH (u)-[:LEARNS_BY]->(learning_style: LearningStyle)
    OPTIONAL MATCH (u)-[:IN_PROGRESS]->(current_courses: Course)
    OPTIONAL MATCH (u)-[:SUBSCRIBED]->(path_start: PathStart)<-[:CREATED]-(path_creator: User)
    WITH {
    	  userID : u.userID,
        username : u.username,
        bio : u.bio,
        email: u.email,
        interest: collect(DISTINCT  PROPERTIES(interested_skills)), 
        experience: collect(DISTINCT PROPERTIES(experienced_skills)),
        learningType: collect(DISTINCT PROPERTIES(learning_style)),
        currentCourses: collect(DISTINCT PROPERTIES(current_courses)),
    	  learningPaths : collect(distinct({name: path_start.name, pathID:path_start.pathID, creator: PROPERTIES(path_creator)}))
        } as returnUser
    RETURN returnUser as user
    `;
    const results = await session.run(query, { id });
    const records = results.records;
    if (records.length === 0) {
      return undefined;
    }
    let result = records[0];
    var user =  result.get('user');
    //todo there is likely a better way around this. Not sure how to null check in cypher
    if(user.learningPaths[0].pathID == null){
      user.learningPaths = []; 
    }
    return user;
  }

  static async findByEmail(session, email) {
    const query = `
    MATCH (u: User {email: $email})
    WITH {
    	  userID : u.userID,
        email: u.email
        } as returnUser
    RETURN returnUser as user
    `;
    const results = await session.run(query, { email });
    const records = results.records;
    if (records.length === 0) {
      return undefined;
    }
    let result = records[0];
    var user =  result.get('user');
    return user;
  }

  static async save(session, user) {
    //TODO this could be improved by figuring out a way to save in a single query. Keeping it simple currently with seperate queries 
    const updateUserNode = `
    MATCH (u: User {userID: $id})
    SET u.username = $username, u.bio = $bio
    `
    const updateExperiences =`
    MATCH (u: User {userID: $id})
    MATCH(s: Skill {skillID: $skillID}) 
    MERGE(u)-[:EXPERIENCED]->(s)
    `
    const updateInterests =`
    MATCH (u: User {userID: $id})
    MATCH(s: Skill {skillID: $skillID}) 
    MERGE(u)-[:INTERESTED]->(s)
    `
    const updateLearningStyle =`
    MATCH (u: User {userID: $id})
    MATCH(s: LearningStyle {learningStyleID: $learningStyleID}) 
    MERGE(u)-[:LEARNS_BY]->(s)
    `

    await session.run(updateUserNode, { id: user.userID, username: user.username, bio: user.bio });

    for (var skill of user.experience) {
      await session.run(updateExperiences, { id: user.userID, skillID: skill.skillID});
    }

    for (var skill of user.interest) {
      await session.run(updateInterests, { id: user.userID, skillID: skill.skillID});
    }

    for (var style of user.learningType) {
      await session.run(updateLearningStyle, { id: user.userID, learningStyleID: style.learningStyleID});
    }


    return this.findById(session, user.userID);
  }
}

module.exports = User;
