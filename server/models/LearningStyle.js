class LearningStyle {
    /**
     * Finds all LearningStyles
     * @param {Session} session 
     */
    static async findAll(session) {
      const query = `
        MATCH (s: LearningStyle)
        RETURN s 
      `;
  
      const results = await session.run(query);
      if (results.records.length === 0) {
        return undefined;
      }
  
      let styleData = results.records.map((style) => {
        return style.get("s").properties;
      });
      
      return { 
        learningStyles: styleData
      };
    }
}

module.exports = LearningStyle;
