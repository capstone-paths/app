"""
Program loads scrapped data into a Neo4j instance as defined in db_conn/.env file.
"""
import sys
import os
# add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from neo4j import GraphDatabase
import uuid
from datetime import datetime
from urllib.parse import quote # library to escape urls
from db_conn import import_params #get database parameters - database host, user name, pwd etc
from interactive_sequence_builder import add_course_to_sequence
import glob



# function to parse scrapped json file
def process_path_json(json_file_wPath):
        file_list = glob.glob(json_file_wPath)

        # process files
        if (len(file_list) == 0):
            print("Either path is invalid or its empty")
        else:
            for i,file in enumerate(file_list):
                print("processing {0}. {1}".format(i+1, file))
                with open(file) as f:
                    sequence_data = json.load(f)
                    add_course_to_sequence.add_courses_to_sequence(import_params.driver, '0', sequence_data['sequence_name'] , '0', sequence_data['track_name'], sequence_data['master_list'], sequence_data['relationship_list'] ,sequence_data['username'] )

        print("Path Json's loading complete.")

# function to load scrapped data as course nodes
def load_path_jsons():
    load_course_choice = input("Load saved Path json data [ y or n only] ? " ) # making course load optional
    if ( load_course_choice.lower() == 'y' ):
        file_choice = input("Load files found at ./path_jsons [ y or n only] ? " )

        if ( file_choice.lower() == 'y' ):
            process_path_json('./path_jsons/*')
        else:
            jFilePath = input("Enter full path of directory with Path JSON files you want to use? ")
            fileExists = os.path.isfile(jFilePath.strip())
            if fileExists:
                process_course_json(jFilePath + "/*")
            else:
                print('{0} file not found '.format(jFilePath))
    else:
        print("Proceeding without loading path json files.")


#comment
#load_scraped_courses_data()
