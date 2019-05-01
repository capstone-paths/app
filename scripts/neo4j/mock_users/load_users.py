# program loads mock user data their learning styles, interests and experience

import sys
import os
import json
# add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from neo4j import GraphDatabase
from db_conn import import_params #get database parameters - database host, user name, pwd etc

# function to add user subscription
def add_user_subscriptions(driver, user_id, path_id):
    with driver.session() as session:
        return session.run("MATCH (u:User {userID:$user_id}), (p:PathStart{pathID:$path_id}) "
                           "WITH u,p "
                           "CREATE (u)-[r:SUBSCRIBED]->(p) "
                           "RETURN id(r)", user_id=user_id, path_id=path_id)

# function to learning style to user
def add_user_learningStyle(driver, user_id, learning_style_id):
    with driver.session() as session:
        return session.run("MATCH (u:User {userID:$user_id}), (l:learningStyle{learningStyleID:$learning_style_id}) "
                           "WITH u,l "
                           "CREATE (u)-[r:LEARNS_BY]->(l) "
                           "RETURN id(r)", user_id=user_id, learning_style_id=learning_style_id)


# function to add experience to user
def add_user_experience_skill(driver, user_id, experience_skill):
    with driver.session() as session:
        return session.run("MATCH (u:User {userID:$user_id}), (s:Skill{name:$experience_skill}) "
                           "WITH u,s "
                           "CREATE (u)-[r:EXPERIENCED]->(s) "
                           "RETURN id(r)", user_id=user_id, experience_skill=experience_skill)

# function to add interest to user
def add_user_interest_skill(driver, user_id, interest_skill):
    with driver.session() as session:
        return session.run("MATCH (u:User {userID:$user_id}), (s:Skill{name:$interest_skill}) "
                           "WITH u,s "
                           "CREATE (u)-[r:INTERESTED]->(s) "
                           "RETURN id(r)", user_id=user_id, interest_skill=interest_skill)


# function to add learning sytle node to database
def add_user(driver, user):
    with driver.session() as session:
        return session.run("MERGE (u:User {userID:$user_id}) "
                           "SET u = $user "
                           "RETURN u.userID as userID", user_id=user['userID'], user=user)

# function to parse learning style json file
def process_mock_user_json(json_file_wPath):
    with open(json_file_wPath) as json_file:
        data = json.load(json_file)

        print("Loading users, learning styles. interestes and experience...")
        for user in data:
            # get user attrs
            user_dict = dict()
            user_dict['firstname'] = user['firstname']
            user_dict['lastname'] = user['lastname']
            user_dict['bio'] = user['bio']
            user_dict['email'] = user['email']
            user_dict['userID'] = user['userID']
            user_dict['username'] = user['username']

            #add user to database
            user_id_obj = add_user(import_params.driver, user_dict)
            user_id = user_id_obj.single().get('userID')


            #add user learning style
            add_user_learningStyle(import_params.driver, user_id, user['learningStyleID'])

            # add user experience
            for exp in user['experienced']:
                add_user_experience_skill(import_params.driver, user_id, exp)

            # add user interests
            for intr in user['interests']:
                add_user_interest_skill(import_params.driver, user_id, intr)

            # add user learning path subscriptions
            for path_id in user['subscribedPaths']:
                add_user_subscriptions(import_params.driver, user_id, path_id)


# function to load users from file
def load_mock_user():
    # process mock users
    print("Using file found at ./mock_users/mock_users.json as source for Users" )
    process_mock_user_json('./mock_users/mock_users.json')



#comment
#load_mock_user()
