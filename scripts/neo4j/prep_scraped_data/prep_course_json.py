"""
Program preprocess scrapped json object to augment it with courseID and covert related courses from URL to courseIDs
"""
import sys
import os
import json
import uuid


# function to create a list of related id'd courses
def convert_urls_to_ids(ided_list, url_lookup):
    for course in ided_list:
        course['CC_Related_Courses_IDs'] = []
        for rel_course_url in course['CC_Related_Courses']:
            course['CC_Related_Courses_IDs'].append(url_lookup.get(rel_course_url.strip(),"N/A"))

    print("Related Course IDs list added to Course objects.")
    return ided_list


# function to parse scrapped json file
def process_course_json(json_file_wPath):
    processed_list = []    # list to hold courses augmented with IDs
    CC_url_ID_lookup = {}       # Class Central url lookup

    LERNTIO_NAMESPACE_DNS = uuid.uuid3(uuid.NAMESPACE_DNS, 'lernt.io') # UUID for the lernt.io domain
    with open(json_file_wPath) as json_file:
        data = json.load(json_file)

        s = set()
        print("Loading courses as nodes into neo4j database...")
        for course in data:
            #adding courseID
            course['courseID'] = str(uuid.uuid3(LERNTIO_NAMESPACE_DNS, course['Provider'].strip() + course['Title'].strip() ))     # course reproducible unique identifier
            CC_url_ID_lookup[course['URL'].strip()] = course['courseID']      # creating ID and CC URL

            #add_course(import_params.driver, modCourse)              # write to database
            processed_list.append(course)

        print("Course IDs added to Course objects & URL - CourseID lookup created")
        return processed_list, CC_url_ID_lookup

# function to load scrapped data as course nodes
def load_scraped_courses_data():
    print("processing file scraped_data/moocdataV2.json")
    ided_list, url_lookup = process_course_json('./scraped_data/moocdataV2.json')

    final_course_list = convert_urls_to_ids(ided_list, url_lookup)

    with open('./scraped_data/moocdataV3.json', 'w') as fp:  #write file
        json.dump(final_course_list, fp)





#comment
load_scraped_courses_data()
