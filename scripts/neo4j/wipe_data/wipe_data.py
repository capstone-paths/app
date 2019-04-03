import os
import sys
from neo4j import GraphDatabase
import import_params

# This script should probably prompt before doing anything
with import_params.driver.session() as session:
    session.run("MATCH (n) DETACH DELETE n;")
