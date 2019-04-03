import json
from neo4j import GraphDatabase
#import hashlib
import uuid
from datetime import datetime
from urllib.parse import quote # library to escape urls
import import_params #get database parameters - database host, user name, pwd etc

#.env file needs to be in current director of the following format

'''
{
"uri":"bolt://ec2-18-220-22-55.us-east-2.compute.amazonaws.com:7687",
"neo4j_user" : "test_user",
"neo4j_passw" : "test123"
}
'''


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

    #clean up later
    '''
    # default effort setting to 0 if not available
    effort = { "lower": 0,
               "upper": 0
             }
    if (len(effort_list) == 2): # if range of effort available
        effort['lower'], effort['upper'] = effort_list
    elif (len(effort_list) == 1):
        effort['lower'] = effort['upper'] = effort_list[0]
    return effort
    '''


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


with open('./moocdata.json') as json_file:
    data = json.load(json_file)

    s = set()
    for course in data:
        modCourse = dict()
        modCourse['courseID'] = str(uuid.uuid4())               # course unique identifier
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

        add_course(import_params.driver, modCourse)              # write to database
