const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const neo4j = require('neo4j-driver').v1;

const { Command, flags } = require('@oclif/command');
const { cli } = require('cli-ux');

class CyderCommand extends Command {
  async run() {
    const { flags } = this.parse(CyderCommand);
    const { file, uri, user, password, shouldReset } = await this.processArgs(flags);

    // This will fail loudly if the file doesn't exist
    if (file) {
      const filePath = path.resolve(__dirname, '..', '..', 'cypher-queries', file);
      const query = fs.readFileSync(filePath, 'utf8');
    }

    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    const session = driver.session();

    if (shouldReset) {
      this.log('Resetting the database...');
      try {
        await session.run('MATCH (n) DETACH DELETE n');
        console.log('pyScriptPath', pyScriptPath);
        PythonShell.run(pyScriptPath, null, (error) => {
          if (error) throw error;
          session.close();
          this.log('Database courses reset');
        });
      }
      catch (e) {
        session.close();
        this.error('Resetting failed: ' + e);
        this.exit(1);
      }
    }
    else {
      try {
        await session.run(query);
      }
      catch (e) {
        session.close();
        this.error('Query read failed: ' + e);
        this.exit(1);
      }

      session.close();
      this.log('Query completed successfully!');
      this.exit(0);
      }
    
  }

  async processArgs(flags) {
    let file = flags.file; 
    const uri = flags.uri || process.env.NEO4J_URI;
    const user = flags.user || process.env.NEO4J_USER;
    const password = flags.password || process.env.NEO4J_PASSWORD;
    const reset = flags.reset;

    let missing = [];
    if (!file && !reset) missing.push('file');
    if (!uri) missing.push('URI');
    if (!user) missing.push('user');
    if (!password) missing.push('password');

    if (missing.length > 0) {
      this.error('Missing the following parameters: ' + missing.toString());
      this.error('Please specify them as flags, or add them to the .env config file');
      this.exit(1);
    }

    if (reset) {
      const reply = await cli.prompt('This will wipe the database and set it to the default init state, are you sure? y/n');
      if (reply !== 'y') {
        this.exit(0);
      }
    }
    const shouldReset = flags.reset;

    return { file, uri, user, password, shouldReset };
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
  reset: flags.boolean({ char: 'r', description: 'resets the database to the initial state'})
}

module.exports = CyderCommand;
