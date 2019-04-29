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

# install required libraries
/usr/bin/apt update
/usr/bin/apt install --upgrade python3-pip -y
/usr/bin/pip3 install --upgrade awscli

# getting database credentials
# db dns
ec2_public_dns=$(/usr/bin/wget -q -O - http://169.254.169.254/latest/meta-data/public-hostname)

# setting cypher browser url
neo4j_cypher_url="[http://$ec2_public_dns:7474/browser/]"

# setting bolt url
neo4j_bolt_url="bolt://$ec2_public_dns:7687"

# getting database credentials from file bitnami_credentials
str=$(/bin/grep -o "'.*'" /home/bitnami/bitnami_credentials)
arr=(${str//' '/ })
neo4j_user=${arr[0]}
neo4j_pwd=${arr[2]}

# setting credentials in parameter store

/usr/bin/aws ssm put-parameter --name "CF_PS_NEO4J_CYPHER_URL" --value "$neo4j_cypher_url" --type String --tier Standard --region us-east-1 --overwrite
/usr/bin/aws ssm put-parameter --name "CF_PS_NEO4J_BOLT_URL" --value "$neo4j_bolt_url" --type String --tier Standard --region us-east-1 --overwrite
/usr/bin/aws ssm put-parameter --name "CF_PS_NEO4J_USER" --value "$neo4j_user" --type String --tier Standard --region us-east-1 --overwrite
/usr/bin/aws ssm put-parameter --name "CF_PS_NEO4J_PWD" --value "$neo4j_pwd" --type String --tier Standard --region us-east-1 --overwrite


# download required jar files (used wget/ curl was getting the html content and not the file)
/usr/bin/wget  -N --directory-prefix=/opt/bitnami/neo4j/plugins/ https://github.com/capstone-paths/app/raw/master/neo4j-plugins/graph-algorithms-algo.jar
/usr/bin/wget  -N --directory-prefix=/opt/bitnami/neo4j/plugins/ https://github.com/capstone-paths/app/raw/master/neo4j-plugins/lernt-neo4j-procedures.jar
#(cd /opt/bitnami/neo4j/plugins/ && curl -O https://github.com/capstone-paths/app/raw/master/neo4j-plugins/graph-algorithms-algo.jar)
#(cd /opt/bitnami/neo4j/plugins/ && curl -O https://github.com/capstone-paths/app/raw/master/neo4j-plugins/lernt-neo4j-procedures.jar)

#download backup
/usr/bin/aws s3 cp s3://lernt-db-backup/lernt_init_db.dump /home/bitnami/lernt_init_db.dump  &
wait


# update Neo4j Configuration file

if cat /opt/bitnami/neo4j/conf/neo4j.conf | grep dbms.security.procedures.unrestricted=algo.*
then
  /bin/echo "Neo4j Config already updated."
else
  /bin/echo "Updaging Neo4j Config"
  lno=$(/bin/grep -nr dbms.security.procedures.unrestricted /opt/bitnami/neo4j/conf/neo4j.conf | /usr/bin/cut -d : -f 1)
  lno+="i"
  /bin/sed -i "$lno"'dbms.security.procedures.unrestricted=algo.*' /opt/bitnami/neo4j/conf/neo4j.conf

fi

export JAVA_HOME="/opt/bitnami/java"
PATH=$JAVA_HOME/bin:$PATH

#load up database
/opt/bitnami/neo4j/bin/neo4j-admin load --from=/home/bitnami/lernt_init_db.dump --database=graph.db --force &
wait

#start database
/opt/bitnami/neo4j/bin/neo4j start
--//
