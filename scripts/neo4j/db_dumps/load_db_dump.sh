#!/bin/sh
# The script allows generating a database backup (dump file) using neo4j-admin utility

# ----------------------------------------------------------
# if neo4j is not part of the path, pass the path to bin directory of the neo4j db installation
# Example : sh load_db_dump.sh /opt/bitnami/neo4j/bin/
# ----------------------------------------------------------

# check if python3 symlink is passed
if [ ! neo4j || $# -lt 1 ];
then
  echo "$0: pass in path of Neo4j bin directory [ Example :  sh create_db_dump.sh /opt/bitnami/neo4j/bin/ ]"
  exit 2
fi

echo $1

# stop neo4j database
$1neo4j stop &
echo "Stopping Neo4j Database"
wait


#download backup
aws s3 cp s3://lernt-db-backup/lernt_init_db.dump ./lernt_init_db.dump  &
wait

# load up database
$1neo4j-admin load --from=./lernt_init_db.dump --database=graph.db --force &
wait


$1neo4j start &
wait
