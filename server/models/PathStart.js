const uuid = require('uuid/v4');

const validatePathStart = require('./validation/PathStartValidation');


class PathStart {

  constructor(pathStartData) {
    const { name } = pathStartData;
    this.id = uuid();
    this.name = name;
  }

  async validate() {
    validatePathStart(this);
  }

  // TODO: We don't need to remove this
  static async create(session, pathStartData) {
    pathStartData.id = uuid();
    validatePathStart(pathStartData);

    const query = `
      CREATE (start: PathStart)
      SET start = {pathStartData}
      RETURN start
    `

    const result = await session.run(query, { pathStartData });
    return new PathStart(result.get('start').properties);
  }
}

module.exports = PathStart;
