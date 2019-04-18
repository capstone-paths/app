class Skill {
    /**
     * Finds all skills
     * @param {Session} session 
     */
    static async findAll(session) {
      const query = `
        MATCH (s: Skill)
        RETURN s 
      `;
  
      const results = await session.run(query);
      if (results.records.length === 0) {
        return undefined;
      }
  
      let skillData = results.records.map((skill) => {
        return skill.get("s").properties;
      });
      
      return { 
        skills: skillData
      };
    }
}

module.exports = Skill;
