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
    OPTIONAL MATCH (User {userID: $id})-[:INTERESTED]->(interested_skills: Skill)
    OPTIONAL MATCH (User {userID: $id})-[:EXPERIENCED]->(experienced_skills: Skill)
    OPTIONAL MATCH (User {userID: $id})-[:LEARNS_BY]->(learning_style: LearningStyle)
    OPTIONAL MATCH (User {userID: $id})-[:IN_PROGRESS]->(current_courses: Course)
    OPTIONAL MATCH (User {userID: $id})-[:SUBSCRIBED]->(path_start: PathStart)<-[:CREATED]-(path_creator: User)
    WITH {
    	  userID : u.userID,
        username : u.username,
        bio : u.bio,
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
