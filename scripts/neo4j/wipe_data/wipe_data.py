# program wipes out data in Neo4j database defined in .env file

import sys
import os
# add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from neo4j import GraphDatabase
from db_conn import import_params # import neo4j driver, credentials

# function checks if a user with a given username exists in the database
def delete_database_query_exec(driver):
        with driver.session() as session:
            return session.run("MATCH (n) DETACH DELETE(n)")


def delete_database():
    print("Database defined in 'db_conn/.env' file : \n {0} \n".format(import_params.uri))
    option = input("\n Do you want wipe out the database? [y or n only] ")
    if ( option.lower() == 'y'):
        delete_database_query_exec(import_params.driver)
        print("Database wiped clean.")


#comment
#delete_database()
