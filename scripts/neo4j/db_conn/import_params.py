'''
Program to establish connection to database
'''
import json
from neo4j import GraphDatabase
import os

'''
.env file needs to be in current director of the following format

{
"uri":"bolt://ec2-18-220-22-55.us-east-2.compute.amazonaws.com:7687",
"neo4j_user" : "test_user",
"neo4j_passw" : "test123"
}

'''

#load params
env_file_fp =  open('./db_conn/.env')
params = json.load(env_file_fp)


uri = params.get('uri')
driver = GraphDatabase.driver(uri, auth=(params.get('neo4j_user'), params.get('neo4j_passw')))
