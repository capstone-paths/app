class Track {

  static async getAllTrackNames(session) {
    const query = `
      MATCH (t: Track) 
      RETURN t
    `;

    const results = await session.run(query);
    if (results.records.length === 0) {
      return undefined;
    }

    let trackData = results.records.map(result => {
      let { trackID, name } = result.get('t').properties;
      return { trackID, name };
    });

    return trackData;
  }

}

module.exports = Track;
