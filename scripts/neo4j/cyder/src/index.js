const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const neo4j = require('neo4j-driver').v1;

const { Command, flags } = require('@oclif/command');
const { cli } = require('cli-ux');

class CyderCommand extends Command {
  async run() {
    const { flags } = this.parse(CyderCommand);
    const { file, uri, user, password, shouldDelete } = await this.processArgs(flags);
    this.log(`file: ${file}, uri: ${uri}, user: ${user}, pass: ${password}, shouldDelete: ${shouldDelete}`);

    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    const session = driver.session();

    if (shouldDelete) {
      this.log('Wiping the database...');
      try {
        await session.run('MATCH (n) DETACH DELETE n');
      }
      catch (e) {
        session.close();
        this.error('Deletion failed: ' + e);
        this.exit(1);
      }
    }

    session.close();
  }

  async processArgs(flags) {
    const file = flags.file || process.env.DEFAULT_FILE; 
    const uri = flags.uri || process.env.NEO4J_URI;
    const user = flags.user || process.env.NEO4J_USER;
    const password = flags.password || process.env.NEO4J_PASSWORD;

    let missing = [];
    if (!file) missing.push('file');
    if (!uri) missing.push('URI');
    if (!user) missing.push('user');
    if (!password) missing.push('password');

    if (missing.length > 0) {
      this.error('Missing the following parameters: ' + missing.toString());
      this.error('Please specify them as flags, or add them to the .env config file');
      this.exit(1);
    }

    if (flags.delete) {
      const reply = await cli.prompt('This will wipe the database, are you sure? y/n');
      if (reply !== 'y') {
        this.exit(0);
      }
    }
    const shouldDelete = flags.delete;

    return { file, uri, user, password, shouldDelete };
  }
}

CyderCommand.description = `CYDER - CYpher DrivER
A command-line utility to read Cypher queries into a Neo4j database instance.
`;

CyderCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({char: 'v'}),
  // add --help flag to show CLI version
  help: flags.help({char: 'h'}),
  file: flags.string({ char: 'f', description: 'file with Cypher queries to read in'} ),
  uri: flags.string({ char: 'i', description: 'Neo4j URI' }),
  user: flags.string({ char: 'u', description: 'Neo4j user' }),
  password: flags.string({ char: 'p', description: 'Neo4j password' }),
  delete: flags.boolean({ char: 'd', description: 'deletes the database clean before reading the file in' }),
}

module.exports = CyderCommand;
