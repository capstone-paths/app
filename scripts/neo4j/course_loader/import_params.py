import json
from neo4j import GraphDatabase

#load params
env_file_fp =  open('.env')
params = json.load(env_file_fp)
#print(params.keys())

uri = params.get('uri')
driver = GraphDatabase.driver(uri, auth=(params.get('neo4j_user'), params.get('neo4j_passw')))
