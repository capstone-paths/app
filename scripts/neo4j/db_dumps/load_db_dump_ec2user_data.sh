Content-Type: multipart/mixed; boundary="//"
MIME-Version: 1.0

--//
Content-Type: text/cloud-config; charset="us-ascii"
MIME-Version: 1.0
Content-Transfer-Encoding: 7bit
Content-Disposition: attachment; filename="cloud-config.txt"

#cloud-config
cloud_final_modules:
- [scripts-user, always]

--//
Content-Type: text/x-shellscript; charset="us-ascii"
MIME-Version: 1.0
Content-Transfer-Encoding: 7bit
Content-Disposition: attachment; filename="userdata.txt"

#!/bin/bash
#script goes into userdata of EC2 to load up data everytime database is started
#reference : https://serverfault.com/questions/797482/how-to-make-ec2-user-data-script-run-again-on-startup
#stop neo4j database
/opt/bitnami/neo4j/bin/neo4j stop &
/bin/echo "Stopping Neo4j Database"
wait

#download backup
/usr/bin/aws s3 cp s3://lernt-db-backup/lernt_init_db.dump /home/bitnami/lernt_init_db.dump  &
wait

export JAVA_HOME="/opt/bitnami/java"
PATH=$JAVA_HOME/bin:$PATH

#load up database
/opt/bitnami/neo4j/bin/neo4j-admin load --from=/home/bitnami/lernt_init_db.dump --database=graph.db --force &
wait

#start database
/opt/bitnami/neo4j/bin/neo4j start
--//
