"""
Program preprocess random user data file adds random experience and interests and subscribes users to some randomly picked
learning paths. Finally creates a JSON file.
mock data was generated using - https://www.generatedata.com/
"""
import sys
import os
import json
import pandas as pd
from random import randint, sample

# add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from neo4j import GraphDatabase
from db_conn import import_params # import neo4j driver, credentials

# experience list of skills
experienceList = ['CSS', 'HTML', 'Python', 'Javascript', 'Mechanical Engineering', 'None']

# interest list of skills
interestList   = ['Angular', 'React', 'UI Design', 'User Experience', 'Graphic Design', 'Ember', 'Information Architecture', 'Meteor', 'NodeJS', 'Full-Stack Engineering', 'Rails', 'Data Science', 'Ruby']



# function gets a random list of learning path IDs
def get_random_paths_query(driver, noPaths):
        with driver.session() as session:
            return session.run("MATCH (p:PathStart) "
                               "WITH p, rand() AS r "
                               "ORDER BY r "
                               "RETURN p.pathID as pathID LIMIT $noPaths",noPaths=noPaths)


# function gets the maximum user id
def get_max_user_id(driver):
        with driver.session() as session:
            return session.run("MATCH (u:User) "
                               "RETURN max(toInt(u.userID))")

# function to user csv file
def process_user_csv(csv_file_wPath):
    processed_list = []    # list to hold users

    #get max user id
    current_get_max_user_id = get_max_user_id(import_params.driver).single()
    if ( current_get_max_user_id.value() == None):
        max_user_id = 1
    else:
        max_user_id = int(current_get_max_user_id.value()) + 1

    with open(csv_file_wPath) as csv_file:
        user_data = pd.read_csv(csv_file_wPath)
        for user in user_data.iterrows():
            user = user[1]      #get user attrs
            user_dict = dict()  #empty user dict
            user_dict['firstname'] = user['first_name']
            user_dict['lastname'] = user['last_name']
            user_dict['bio'] = user['bio']
            user_dict['learningStyleID'] = user['learning_style_id']
            user_dict['email'] = user['username']
            user_dict['username'] = user['first_name'].lower() + '_' + user['last_name'].lower()

            # get random list of PathIDs
            recs = get_random_paths_query(import_params.driver, randint(1,5))

            subcPathList = []
            for i,path in enumerate(recs):
                subcPathList.append(path.get('pathID'))

            # get Experience and Interests
            user_dict['subscribedPaths'] = subcPathList.copy() # adding paths

            user_dict['experienced'] = sample(experienceList, randint(1,3))
            user_dict['interests'] = sample(interestList, randint(1,3))

            user_dict['userID'] = str(max_user_id)         # get max user

            max_user_id = max_user_id + 1   #increment user


            processed_list.append(user_dict)



        print("User augmented with interest, Experience and subscription")
        return processed_list


# function to prep user data
def prep_mock_users_data():
    print("processing file mock_users/mock_users.csv")
    final_user_list = process_user_csv('./mock_users/mock_users.csv')


    with open('./mock_users/mock_users.json', 'w') as fp:  #write file
        json.dump(final_user_list, fp)



#comment
prep_mock_users_data()
