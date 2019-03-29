cyder (CYpher DrivER)
===== 

A tool to execute Cypher queries from a file and into a Neo4j instance

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)

<!-- toc -->
# Intro
<!-- intro -->
`cyder` is a CLI tool that allows you to easily read in a list of Cypher queries from a file and into a Neo4j instance.

The tool is meant to allow to quickly change the database state during development (for example, by resetting it, or adding new subgraphs).

In a nutshell, it saves you having to copy and paste Cypher commands around : )

It is built with [oclif](https://github.com/oclif/oclif) which is an amazing Javascript CLI framework made by Heroku.

# Install
<!-- install -->

From this directory run:

`npm install`

Then run:

`npm link`

You should now be able to run `cyder` from anywhere.

# Usage
<!-- usage -->
`$ cyder [options]`

**Important: `file`, `uri`, `user` and `password` are mandatory parameters that need to be passed either through flags as detailed here, or through a config file (see below)**

#### OPTIONS
```
  -d, --delete             wipes the database clean before reading the file in (prompts for confirmation)
  -f, --file=file          file with Cypher queries to read in
  -h, --help               show CLI help
  -i, --uri=uri            Neo4j URI
  -p, --password=password  Neo4j password
  -u, --user=user          Neo4j user
  -v, --version            show CLI version
```

# Configuration (Optional)
<!-- configuration -->
If you don't want to pass flags around, you can store your configuration in a `.env` file at the root of `cyder` (ie, alongside this readme) - the tool will read it all in.

You can mix and match config variables and flags, with the latter taking precedence in execution.

Example `.env`

```
NEO4J_URI="bolt://localhost:7687"
NEO4J_USER="neo4j"
NEO4J_PASSWORD="neo4j"
DEFAULT_FILE="file_to_read_in"
```

# Examples

Fully loaded command:

`cyder -f db-init-alex-000 -i bolt://localhost:7687 -u neo4j -p neo4j -d`

Just filename and deletion (rest in config file):

`cyder -f db-init-alex-000 -d`

Everything in config file:

`cyder`

