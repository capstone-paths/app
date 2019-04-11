# program to Neo4j Environment verify environment
import os
import json
from neo4j import GraphDatabase

# sample .env file structure
sample_envFile_structure = {
"uri":"bolt://ec2-18-400-62-45.us-east-2.compute.amazonaws.com:7687",
"neo4j_user" : "test_user",
"neo4j_passw" : "test123"
}

# function to verify database connection
def verify_db_con(params):
    uri = params.get('uri')
    try:
        driver = GraphDatabase.driver(uri, auth=(params.get('neo4j_user'), params.get('neo4j_passw')))
        print("Database connection successful!")
        return True
    except :
        print("Unable to connect to Database, verify database URL, user name and password in db_conn/.env file ")
        return False

# function to check environment file .env
def check_env():
    fileExists = os.path.isfile('./db_conn/.env')
    if fileExists:
        print("Current Directory")
        print(os.getcwd())                   # printing current directory

        print("'.env' file exists in the directory : db_conn")
        print("Verifying 'db_conn/.env' structure....")

        try:
            with open('./db_conn/.env') as env_file_fp: # open env file
                params = json.load(env_file_fp)      # load parameter

                # checking if all parameters exists
                if ( params.get('uri','NA') == 'NA' ):
                    print("'.env' missing param 'uri' : Neo4j db URI ")
                    return False
                elif ( params.get('neo4j_user','NA') == 'NA'  ):
                    print("'.env' missing param 'neo4j_user' : Neo4j db User ")
                    return False
                elif ( params.get('neo4j_passw','NA') == 'NA'  ):
                    print("'.env' missing param 'neo4j_passw' : Neo4j db Password ")
                    return False

                # verifying database connection
                return verify_db_con(params)

        except:
            print("failed to open db_conn/.env, may be empty")
            return False

    else:
        print("\nFile 'db_conn/.env' missing in current directory : {0}".format(os.getcwd()))
        print("\nCreating a file of this format in the current directory and save as '.env' ")
        print(sample_envFile_structure) # print sample structure
        uri = input("\nEnter Neo4j bolt URI including port. [ Example : bolt://ec2-18-400-62-45.us-east-2.compute.amazonaws.com:7687 ] : ")
        user = input("\nEnter Neo4j database user name : ")
        pwd = input("\nEnter Neo4j database password for the above user name : ")

        # create dict
        env_dict = {
        "uri" : uri,
        "neo4j_user" : user,
        "neo4j_passw" : pwd
        }

        # write dict to file
        json_str = json.dumps(env_dict)
        with open('./db_conn/.env', 'w') as file:
            file.write(json_str)

        with open('./db_conn/.env') as env_file_fp: # open env file
            params = json.load(env_file_fp)    # load parameter
            print("'.env' file created Successfully.")
            print(params)

            # verifying database connection
            return verify_db_con(params)



#comment after test
#status = check_env()
#print(status)
