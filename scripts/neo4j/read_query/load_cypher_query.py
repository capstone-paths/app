"""
Program loads cypher queries into Neo4j database defined in .env file
"""
import sys
import os
# add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from neo4j import GraphDatabase
from db_conn import import_params #get database parameters - database host, user name, pwd etc
import glob

# function to list files in a directory
def get_list_cypher_files(path="./cypher_queries/*"):
    try:
        flist = glob.glob(path)
        return flist
    except:
        print("Invalid path : {0}".format(path))

# function to get the file with cypher queries
def get_query_file():
    get_path = input("Use default path to cypher queries : './cypher_queries/' ? ( y or n only ) ")

    # preprocess path
    if ( get_path.lower() == 'n' ):
        path = input("Enter path to cypher query directory : ")
        if path[-1] == '/':
            path = path + '*'
        else:
            path = path + '/*'
    else:
        path = "./cypher_queries/*"

    # get list of files in cypher_queries Directory
    file_list = get_list_cypher_files(path)

    # list files
    if (len(file_list) == 0):
        print("Either path is invalid or its empty")
    else:
        for i,file in enumerate(file_list):
            print("{0}. {1}".format(i+1, file))


    user_sel = input("Enter index of the file you want to load : ")
    qfile = file_list[int(user_sel)-1]

    return qfile


# function checks if a user with a given username exists in the database
def execute_query(driver,query):
        with driver.session() as session:
            return session.run(query)

# function to process query file line by line
def process_query_file():

    des = input("Do you want to process file with cypher queries? [y or n only]")

    if (des.lower()=='n'):
        return
    # get query file
    query_file = get_query_file()

    print("File picked for processing : {0}".format(query_file))
    print("Starting execution of script ...")

    #execute file in one shot
    with open(query_file) as f:
        query = f.read()
        execute_query(import_params.driver, query)

    print("Execution of script complete.")
