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


# function to add course node to database
def add_course(driver, course):
    with driver.session() as session:
        return session.run("MERGE (a:Course {course_id:$course_id}) "
                           "SET a = $course "
                           "WITH a "
                           "MERGE (b:Subject {subject:a.subject})"
                           "CREATE (a)-[:BELONGS_TO]->(b)"                   # adding relationship between course and subject
                           "MERGE (c:Institution {institution:a.institution})"
                           "CREATE (a)-[:IS_FROM]->(c)"                      # adding relationship between course and institution
                           "RETURN id(a)", course_id=course['courseID'], course=course)

# function to extract hours from effort description
def parse_effort(effort_desc):
    # extract effort hours
    effort_list = [int(word) for word in effort_desc.replace('-',' ').split() if word.isdigit()]
    return effort_list


# function to parse cost involved
def parse_cost(cost_desc):
    if ('Audit' in cost_desc):
        return 'audit'
    elif ('Free' in cost_desc):
        return 'free'
    else:
        return 'N/A'


# function to course duration from duration description
def parse_duration(duration_desc):
    # extract effort hours
    duration_list = [int(word) for word in duration_desc.replace('-',' ').split() if word.isdigit()]

    if (len(duration_list) > 0):
        return duration_list[0] # keeping it simple, in few cases where there is range available just picking one of the hours
    else:
        return 0 # return 0 if no effort available


# function to parse date string to date
def parse_date(date_str):
    cln_date_str = date_str.replace('th','').replace('st','').replace('rd','').replace('nd','').replace(',','')
    if (date_str == 'Self paced' or 'N/A' in date_str or 'NA' in date_str):
        return datetime.strptime('1 Jan 1970', '%d %b %Y') # setting to epoch date for self paced courses
    elif len(cln_date_str.split())==2:
        return datetime.strptime('1 ' + cln_date_str, '%d %b %Y') # scenrio - only month and year available
    elif len(cln_date_str.split())==1:
        return datetime.strptime('1 Jan ' + cln_date_str, '%d %b %Y') # scenrio - only year available
    else:
        return datetime.strptime(cln_date_str, '%d %b %Y')

# parse no of reviews
def parse_no_reviews(no_review_str):
    return int(no_review_str.split()[0])


# function to parse scrapped json file
def process_course_json(json_file_wPath):
    LERNTIO_NAMESPACE_DNS = uuid.uuid3(uuid.NAMESPACE_DNS, 'lernt.io') # UUID for the lernt.io domain
    with open(json_file_wPath) as json_file:
        data = json.load(json_file)

        s = set()
        print("Loading courses as nodes into neo4j database...")
        for course in data:
            modCourse = dict()
            if (course.get('courseID',"None") == "None"):         # add ID if not already in the file (to handle V1)
                modCourse['courseID'] = str(uuid.uuid3(LERNTIO_NAMESPACE_DNS, course['Provider'].strip() + course['Title'].strip() ))     # course reproducible unique identifier
            else:
                modCourse['courseID'] = course['courseID']
            modCourse['name']     = course['Title'].strip()         # name of course
            modCourse['effort']   = parse_effort(course['Effort'])  # course effort
            modCourse['cost']     = parse_cost(course['Cost'])      # cost
            modCourse['duration'] = parse_duration(course['Duration'])      # course duration
            modCourse['subject']  = course['Subject'].strip()      # subject
            modCourse['url']      = quote(course['URL'].strip(), safe='')  # escape url
            modCourse['provider']  = course['Provider'].strip()      # provider
            modCourse['language']  = course['Language'].strip()      # language
            modCourse['startDate'] = parse_date(course['Start Date'])      # course start date
            modCourse['syllabus']  = course['Syllabus'].strip()      # syllabus
            modCourse['instructors']  = course['Instructors']      # list of instructors
            modCourse['session']  = course['Session'].strip()      # session status
            modCourse['institution']  = course['Partner'].strip()      # institution
            modCourse['overview']  = course['Overview'].strip()      # overview

            # V3 fields
            modCourse['relatedCoursesURL']  = course['CC_Related_Courses']                     # related courses list
            modCourse['relatedCoursesIds']  = course['CC_Related_Courses_IDs']                 # related Course IDs
            modCourse['noReviews']          = parse_no_reviews(course['CC_Number_Of_Reviews']) # No of Reviews
            modCourse['tags']               = course['CC_Tags']                                # tags
            modCourse['rating']             = int(course['CC_Rating'])                         # course rating

            add_course(import_params.driver, modCourse)              # write to database
        print("Course loading complete.")

# function to load scrapped data as course nodes
def load_scraped_courses_data():
    file_choice = input("Use file found at ./scraped_data/moocdataV3.json as source of course nodes [ y or n only] ? " )

    if ( file_choice.lower() == 'y' ):
        process_course_json('./scraped_data/moocdataV3.json')
    else:
        jFilePath = input("Enter full path of JSON file you want to use? ")
        fileExists = os.path.isfile(jFilePath.strip())
        if fileExists:
            process_course_json(jFilePath)
        else:
            print('{0} file not found '.format(jFilePath))


#comment
#load_scraped_courses_data()
