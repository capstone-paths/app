
"""
Program allows courses to learning path / sequence
"""

import sys
import os
# add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from neo4j import GraphDatabase
from db_conn import import_params # import neo4j driver, credentials
import uuid
import json

# function checks if a sequence exists in the database
def check_if_sequence_exists(driver,sequence_name):
        with driver.session() as session:
            return session.run("MATCH (s:PathStart) "
                               "WHERE toLower(s.name) = $sequence_name "
                               "RETURN id(s)", sequence_name=sequence_name.strip().lower())

# function creates a sequence node
def create_sequence(driver, sequence_name, sequence_id):
        with driver.session() as session:
            return session.run("MERGE (s:PathStart { pathID : $sequence_id,  name : $sequence_name }) "
                               "RETURN id(s)", sequence_id=sequence_id, sequence_name=sequence_name.strip())

# function creates a track node
def create_track(driver, track_name, track_id):
        with driver.session() as session: # using merge so that it will be created only if it does not exists
            return session.run("MERGE (t:Track { trackID : $track_id,  name : $track_name }) "
                               "RETURN id(t)", track_name=track_name.strip(), track_id=track_id)


# function to add input courses to sequence
def add_courses_to_sequence(driver, sequence_id, sequence_name, track_id, track_name, course_list, relationship_pair_list, user_name):
        no_nodes = len(course_list) # get number of nodes, pos=0 being sequence and len -1 will have track node

        #get max sequence id if passed in id is 0, this is identifying loading saved json objects whose id may not be relevant anymore
        if (sequence_id == '0'):
            sequence_id = get_max_sequence_id()

            if sequence_id == 0:
                return 0 # pass control back if sequence with same name already exits

        if (track_id == '0'):
            track_id = get_max_track_id()

        with driver.session() as session:

            tx = session.begin_transaction() # open transaction to allow committing multiple transactions at a time

            create_sequence(driver, sequence_name, sequence_id)
            create_track(driver, track_name, track_id)
            for pair_no, relationship in enumerate(relationship_pair_list):
                if (relationship[0] == 0):
                    tx.run("MATCH (a:PathStart {pathID:$sequence_id}) "
                                       "MATCH (b:Course { courseID : $course_id}) "
                                       "WITH a,b "
                                       "MERGE (a)-[:NEXT {pathID:$sequence_id}]->(b)"
                                       "RETURN id(a)", sequence_id=sequence_id, course_id=course_list[relationship[1]])

                elif (relationship[1] == (no_nodes-1)): #check if tracknode
                    tx.run("MATCH (a:Course {courseID:$start_course_id}) "
                           "MATCH (b:PathStart{pathID:$sequence_id}) "
                           "MATCH (t:Track{name:$track_name}) "
                                       "MERGE (b)-[:BELONGS_TO]->(t) " # handling unbound node issue
                                       "WITH a,t "
                                       "MERGE (a)-[:NEXT {pathID:$sequence_id}]->(t)"
                                       "RETURN id(a)", sequence_id=sequence_id, start_course_id=course_list[relationship[0]], track_name=course_list[relationship[1]])
                else:
                    tx.run("MATCH (a:Course {courseID:$start_course_id}), (b:Course { courseID : $end_course_id}) "
                                       "WITH a,b "
                                       "MERGE (a)-[:NEXT {pathID:$sequence_id}]->(b)"
                                       "RETURN id(a)", sequence_id=sequence_id, start_course_id=course_list[relationship[0]],
                                       end_course_id=course_list[relationship[1]])


            # link user to learning path /sequence
            tx.run("MATCH (u:User), (s:PathStart) "
                               "WHERE toLower(u.username) = toLower($user_name) "
                               "and s.pathID = $sequence_id "
                               "WITH u,s "
                               "MERGE (u)-[:CREATED]->(s) "
                               "RETURN id(u)", user_name=user_name.strip().lower(), sequence_id=sequence_id )

            tx.commit() # committing transaction

            print("\nLearning Path created Successfully!!")
            print("Learning Path : {0} with pathID = {1} belonging to Track : {2} was Successfully created by user : {3}".
            format(sequence_name, sequence_id, track_name, user_name))

            print("\n")
            print("Run the below query in the Neo4j Browser to view the results")
            print("===========================================================================================================================================")
            print("match(u:User)-[]-(s:PathStart{pathID:'" + str(sequence_id) + "'})-[r:NEXT*{pathID:'" + str(sequence_id) + "'}]-(c:Course)-[cr:NEXT*{pathID:'" + str(sequence_id) + "'}]-(t:Track)-[b:BELONGS_TO]-(p) return u,s,r,c,cr,t,b,p")
            print("===========================================================================================================================================")
            return True

# function gets the max id to be used for sequence
def get_max_sequence_id():
    #check if sequence already exits
    if check_if_sequence_exists(import_params.driver, sequence_name).single():
        print('Sequence/Path "{0}" already exists'.format(sequence_name))
        return 0
    else:
        current_max_sequence_id = get_max_sequence_id_query(import_params.driver).single()
        if ( current_max_sequence_id.value() == None):
            return '1' # set to 1 if no sequences available
        else:
            return str(int(current_max_sequence_id.value()) + 1)


# function gets the max id to be used for track
def get_max_track_id():
    current_max_track_id = get_max_track_id_query(import_params.driver).single()
    if ( current_max_track_id.value() == None):
        sequence_data['track_id'] = '1'
    else:
        sequence_data['track_id'] = str(int(current_max_track_id.value()) + 1)




# writing sequence / learning path to database
#add_courses_to_sequence(import_params.driver, sequence_data['sequence_id'], sequence_data['sequence_name'] , sequence_data['track_id'], sequence_data['track_name'], sequence_data['master_list'], sequence_data['relationship_list'] ,sequence_data['username'] )
