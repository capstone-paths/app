import os
import sys
from neo4j import GraphDatabase

filename = sys.argv[1]
cur = os.path.dirname(os.path.abspath(__file__))
joined = os.path.join(cur, "../cypher-queries" + "/" + filename)
path = os.path.normpath(joined)

with open(path, 'r') as file:
    query = file.read()
    driver = GraphDatabase.driver("bolt://localhost:76877", auth=("neo4j", "1234"))
    with driver.session() as session:
        session.run(query)


