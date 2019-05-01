# program wipes out data in Neo4j database defined in .env file

import sys
import os
import json
# add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from neo4j import GraphDatabase
from db_conn import import_params #get database parameters - database host, user name, pwd etc

# function to add skill node to database
def add_skill(driver, skill, ctr):
    with driver.session() as session:
        return session.run("CREATE (a:Skill {skillID:$skill_id}) "
                           "SET a.name = $skill " # set tags
                           "RETURN id(a)", skill_id=ctr, skill=skill)


# function to parse scrapped json file
def process_skills_file(skill_file_wPath):
    print("Loading Skills as nodes into neo4j database...")
    with open(skill_file_wPath) as skill_file:
        skill = skill_file.readline().strip()             # read skill from file
        ctr = 1
        while skill:
            add_skill(import_params.driver, skill, str(ctr))
            skill = skill_file.readline().strip()
            ctr = ctr + 1


# function to add learning sytle node to database
def add_learning_style(driver, learningStyle):
    with driver.session() as session:
        return session.run("MERGE (a:LearningStyle {learningStyleID:$learning_style_id}) "
                           "SET a = $learningStyle "
                           "RETURN id(a)", learning_style_id=learningStyle['learningStyleID'], learningStyle=learningStyle)

# function to parse learning style json file
def process_learning_style_json(json_file_wPath):
    with open(json_file_wPath) as json_file:
        data = json.load(json_file)

        s = set()
        print("Loading Learning Styles as nodes into neo4j database...")
        for learningStyle in data:
            add_learning_style(import_params.driver, learningStyle)


# function to load skills from file
def load_user_skills():
    # process custom tagging file
    print("Using file found at ./user_skills/skills_list as source for skill nodes" )
    process_skills_file('./user_skills/skills_list')

    print("Using file found at ./user_skills/learning_style.json as source for learning style nodes" )
    process_learning_style_json('./user_skills/learning_styles.json')



#comment
#load_user_skills()
