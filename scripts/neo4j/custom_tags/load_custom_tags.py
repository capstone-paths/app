"""
Program loads custom tags for course data.
"""
import sys
import os
# add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import csv
from neo4j import GraphDatabase
import uuid
from datetime import datetime
from urllib.parse import quote # library to escape urls
from db_conn import import_params #get database parameters - database host, user name, pwd etc


# function to add course node to database
def add_tags(driver, course_id, tags):
    with driver.session() as session:
        return session.run("MERGE (a:Course {courseID:$course_id}) "
                           "SET a.tags = $tags " # set tags
                           "RETURN id(a)", course_id=course_id, tags=tags)

# function to parse scrapped json file
def process_course_tags(csv_file_wPath):
    LERNTIO_NAMESPACE_DNS = uuid.uuid3(uuid.NAMESPACE_DNS, 'lernt.io') # UUID for the lernt.io domain

    with open(csv_file_wPath) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        print("Loading custom tags for courses...")
        for line_count, course in enumerate(csv_reader):
            if line_count == 0:
                continue # skip Header Row
            else:
                # generate course ID provider + Title
                courseID = str(uuid.uuid3(LERNTIO_NAMESPACE_DNS, course[3].strip() + course[1].strip() ))
                if len(course[5])==0:
                    continue
                else:
                    tags = [ tag.strip() for tag in course[5].replace('"','').split(",")] # list of custom tags


            add_tags(import_params.driver, courseID, tags)              # write to database
            #print(courseID, tags)
        print("Adding tags to Course nodes complete.")

# function to load scrapped data as course nodes
def load_custom_tags_for_courses():
    # process custom tagging file
    tag_file_choice = input("Use file found at ./custom_tags/moocdata_with_custom_tags.csv as source to update course tags [ y or n only] ? " )

    if ( tag_file_choice.lower() == 'y' ):
        process_course_tags('./custom_tags/moocdata_with_custom_tags.csv')
    else:
        tFilePath = input("Enter full path of CSV file you want to use? ")
        fileExists = os.path.isfile(tFilePath.strip())
        if fileExists:
            process_course_tags(tFilePath)
        else:
            print('{0} file not found '.format(tFilePath))

#comment
#load_custom_tags_for_courses()
