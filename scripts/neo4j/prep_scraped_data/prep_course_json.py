"""
Program preprocess scrapped json object to augment it with courseID and covert related courses from URL to courseIDs
Updated to get categories and key phrases using AWS Comprehend
"""
import sys
import os
import json
import uuid
import boto3


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


# function to use AWS Comprehend to generate categories( Comprehend Titles) & key phrases
# this can aid in automatic building of sequences
def generate_categories_keyphrases(course_list):
    processed_list = []    # list to hold courses augmented with categories, key phrases
    for course in course_list:
        comprehend = boto3.client(service_name='comprehend', region_name='us-east-2')

        name = course['Title'] # get course title

        course['categories_awsc']  = getCategories(comprehend, name) # derive categories AWS C
        course['key_phrases_awsc'] = getKeyPhrases(comprehend, name) # derive key phrases AWS C

        processed_list.append(course)


    print("Categories/key phrases added to Course objects.")
    return processed_list

# function to get categories using AWS Comprehend
def getCategories(comprehend, text):
    responseBody = comprehend.detect_entities(Text=text, LanguageCode='en')
    entities = responseBody['Entities']

    categories = []
    for entity in entities:
        if entity.get('Type') == 'TITLE':
            categories.append(entity.get('Text','N/A'))

    return categories

# function to get key phrases using AWS Comprehend
def getKeyPhrases(comprehend, text):
    responseBody = comprehend.detect_key_phrases(Text=text, LanguageCode='en')
    keyphrases = responseBody['KeyPhrases']

    key_phrases = []
    for phrase in keyphrases:
        key_phrases.append(phrase.get('Text','N/A'))

    return key_phrases


# function to load scrapped data as course nodes
def load_scraped_courses_data():
    print("processing file scraped_data/moocdataV2.json")
    ided_list, url_lookup = process_course_json('./scraped_data/moocdataV2.json')

    intr_course_list = convert_urls_to_ids(ided_list, url_lookup)

    final_course_list = generate_categories_keyphrases(intr_course_list)

    with open('./scraped_data/moocdataV4.json', 'w') as fp:  #write file
        json.dump(final_course_list, fp)



#comment
load_scraped_courses_data()
