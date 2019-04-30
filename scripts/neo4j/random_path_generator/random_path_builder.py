
"""
Program allows generating random learning paths which is saved to json files.

"""
import sys
import os
# add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from neo4j import GraphDatabase
from db_conn import import_params # import neo4j driver, credentials
import uuid
import json
import random
#from random_word import RandomWords # library to get random adjectives

from interactive_sequence_builder import add_course_to_sequence

# function checks if a user with a given username exists in the database
def check_if_user_exists(driver,user_name):
        with driver.session() as session:
            return session.run("MATCH (u:User) "
                               "WHERE toLower(u.username) = $user_name "
                               "RETURN id(u)", user_name=user_name.strip().lower())

# function gets a sample of users from the database
def get_random_user_query(driver):
        with driver.session() as session:
            return session.run("MATCH (u:User) "
                               "WITH u, rand() AS r "
                               "ORDER BY r "
                               "RETURN u.username as username LIMIT 1")

# function checks if a sequence exists in the database
def check_if_sequence_exists(driver,sequence_name):
        with driver.session() as session:
            return session.run("MATCH (s:PathStart) "
                               "WHERE toLower(s.name) = $sequence_name "
                               "RETURN id(s)", sequence_name=sequence_name.strip().lower())

# function gets the maximum path id from the database to be used to generate the next id
def get_max_sequence_id(driver):
        with driver.session() as session:
            return session.run("MATCH (s:PathStart) "
                               "RETURN max(toInt(s.pathID))")

# function checks if a track exists
def check_if_track_exists(driver,track_name):
        with driver.session() as session:
            return session.run("MATCH (t:Track) "
                               "WHERE toLower(t.name) = $track_name "
                               "RETURN t.name as name, t.trackID as trackID", track_name=track_name.strip().lower())

# function gets the maximum track id from the database to be used to generate the next id
def get_max_track_id(driver):
        with driver.session() as session:
            return session.run("MATCH (t:Track) "
                               "RETURN max(toInt(t.trackID))")


# function gets course id for the input course name
def get_category(driver,category):
        with driver.session() as session:
            return session.run("MATCH(c:Course) "
                               "WHERE ANY( l in c.key_phrases_awsc where toLower(l) contains $category) "
                               "UNWIND c.key_phrases_awsc as cat "
                               "WITH cat "
                               "WHERE cat contains $category "
                               "WITH collect(cat) AS CatList "
                               "UNWIND CatList as cat "
                               "WITH cat, count(*) as no_courses "
                               "return cat, no_courses "
                               "ORDER BY no_courses DESC", category=category.strip().lower())



# function to save path objects locally
def write_sequence_to_json(sequence):
    save_decision = input("\nDo you want to save the sequence json object locally. If saved the .json can be imported again to the database ? [y or n only] : ")

    # if user wants to save file
    if(save_decision.lower()=='y'):
        print("Saving Path Object locally as .json")
        fileExists = os.path.exists('path_jsons')      # check if directory exists
        if not fileExists:
            os.makedirs('path_jsons')                    # create directory if no

        json_file = sequence['sequence_name'].replace(' ','_').lower() + '.json' # json file name
        with open( os.path.join('path_jsons', json_file ), 'w') as fp:
            json.dump(sequence, fp)
            print("JSON {0} has been saved in directory 'path_jsons'".format(json_file))



# function gets track name from user
def get_track_info(category_data):
    # get track name from user
    track_name = input('Enter track name : ')

    #check if track already exits
    track_n = check_if_track_exists(import_params.driver, track_name).single()
    if ( track_n ):
        print('Track "{0}" already exists. Attaching randomly generated sequences to Track "{0}".'.format(track_name))
        category_data['track_name'] = track_n.value(0) # capture track name returned from db
        category_data['track_id'] = track_n.value(1)
    else:
        category_data['track_name'] = track_name # capture input track name
        current_max_track_id = get_max_track_id(import_params.driver).single()
        if ( current_max_track_id.value() == None):
            category_data['track_id'] = '1'
        else:
            category_data['track_id'] = str(int(current_max_track_id.value()) + 1)


# function gets user name from user
def get_random_user(category_data):
    random_user = get_random_user_query(import_params.driver)
    #category_data['username'] = random_user.single().get('username')
    return random_user.single().get('username')


# function check if result has records
def isResultRecord(results):
    if results.peek() == None:
        return False
    else:
        return True


# function gets course list for the sequence
def get_course_categories_4sequence(category_data):
    category_list = []     # list to hold category
    #course_id_list = []  # list to hold course id
    cont = 'y'           # continue getting courses

    category_counter = 1
    while (cont.lower() == 'y'):
        print("\n")
        category = input('Enter {0} course category keyword for searching : '.format(category_counter))

        recs = get_category(import_params.driver,category)

        tempCategoryList = []      # hold category till final

        if ( isResultRecord(recs) ):
            #for i,cat in enumerate(r.get('CatList')):
            for i,cat in enumerate(recs):
                print("{0}. {1} ({2})".format(i+1, cat.get('cat'), cat.get('no_courses')))
                tempCategoryList.append(cat.get('cat'))
            #tempCourseIDList.append(r.get('courseID'))

            category_choice = input('Enter Choice, category # : ')
            assert int(category_choice) >= 1 and int(category_choice)<= i+1, 'invalid category choice, rolling back, restart'
            category_list.append(tempCategoryList[int(category_choice)-1])
            #course_id_list.append(tempCourseIDList[int(course_choice)-1])
        else:
            print('There is no course category with keyword "{0}"'.format(category))
            continue

        cont = input ("continue? y or n : ")       # continue getting courses ?
        category_counter += 1


    category_data['category_list'] = [ '<Random Generated Sequence Name> (PathStart / Start Node)'] + category_list + [category_data['track_name'] + '(Track / End Node)']
    category_data['category_list_cln'] = [ '<Random Generated Sequence Name> (PathStart / Start Node)'] + category_list + [ category_data['track_name'] ]



# function gets relationship for courses in the sequence
def get_relationships(category_data):
    print("Let's Build relationship between categories.......")

    print("Categories added to the list and their index : \n")
    for i, category in enumerate(category_data['category_list']):
        print(i, category)

    valid = 'n' # flag to track status

    while (valid.lower() == 'n') :
        relationship_list = []
        rel_ctr = 1;
        print("Enter relationship between nodes?")
        print("Note : 1. first relationship 'start node' should always be the index of pathStart Node")
        print("       2. last relationship 'end node' should always be 'Track' node index " )

        rel_done = False
        while (not rel_done):
            rel_item = []
            st_node_index = input("Enter {0} relationship 'start node' index : ".format(rel_ctr))

            if (rel_ctr == 1 and int(st_node_index) != 0):
                print("First Node entered was not the  PathStart Node index, aborting...")
                break # restart entering relationships
            elif (int(st_node_index) < 0 or int(st_node_index) > i):
                print("Entered index is out of range")
                continue
            else:
                rel_item.append(int(st_node_index))

            end_node_index = input("Enter {0} relationship 'end node' index : ".format(rel_ctr))

            if ( int(end_node_index) < 0 or int(end_node_index) > i ):
                print("Enter index out of range")
                continue
            else:
                rel_item.append(int(end_node_index))

            relationship_list.append(rel_item) # add relationship to list

            print("relationships entered so far {0} ".format(relationship_list))

            status = input("Continue? Input another relationship. Enter 'y' or 'n' ? ")
            rel_ctr = rel_ctr + 1

            if status == 'n':
                rel_done = True # marking completion of inputing relationship
                # checking if enough relationship exists
                if ( (rel_ctr-1) < (len(category_data['category_list'])-1) ):
                    print("Not enough relationships established, aborting")
                    exit(0)


        if (len(rel_item)<2): # less than two relationships entered
            valid = 'n' # repeat process
        elif (rel_item[1] != i):
            print("Last Node entered was not the  Track Node index, restarting...") #invalid repeat
        else:
            valid = 'y' #marking completion

    category_data['relationship_list'] = relationship_list.copy()

# function to generate random path names
def generate_random_sequence_name(username, track_name, path_no):
    adj_list = ['breathtaking','amazing','stunning','astounding','astonishing','awe-inspiring','stupendous','staggering','extraordinary','incredible','unbelievable; magnificent','wonderful','spectacular','remarkable','phenomenal','prodigious','miraculous','sublime; formidable','imposing','impressive','mind-boggling','mind-blowing','out of this world','supercalifragilisticexpialidocious','badass','wondrous']
    #adj = RandomWords().get_random_word(includePartOfSpeech="adjective")
    adj = random.choice(adj_list)
    return username + "'s " + adj + " " + track_name + " Track"

# function to get random course for category
def get_random_course_for_category_query(driver, category):
    with driver.session() as session:
        return session.run("MATCH(c:Course) "
                           "WHERE ANY( l in c.key_phrases_awsc where toLower(l) contains $category) "
                           "WITH c, rand() AS r "
                           "ORDER BY r "
                           "return c.courseID AS Course LIMIT 1", category=category.strip().lower())

# function to get random course
def get_random_course_for_category(category):
    random_course = get_random_course_for_category_query(import_params.driver, category)
    #print(random_course.single().get('Course'))
    return random_course.single().get('Course')


# function to assign course to category
def generate_course_list(sequence_name, category_list):
    course_list = []

    no_entries = len(category_list)

    for i, category in enumerate(category_list):
        if (i==0): #implies sequence name
            course_list.append(sequence_name)
            continue

        if ( i== (no_entries-1) ): # implies track
            course_list.append(category)
            continue

        random_course = get_random_course_for_category(category)
        course_list.append(random_course) # adding course

    return course_list



def main():
    category_data = {} #dict to hold category attributes

    print("\n")
    # get track name
    get_track_info(category_data)

    # get user name from user
    get_random_user(category_data)

    # get category for the sequence
    get_course_categories_4sequence(category_data)

    # get relationships among categories in sequence
    get_relationships(category_data)

    # how many paths to be created
    how_many_paths = input('Enter how many random paths/sequences to generate?')

    # generating paths
    for path_no in range(int(how_many_paths)):
        user_name = get_random_user(category_data)                                     # user name
        track_name = category_data['track_name']                                       # track name
        sequence_name = generate_random_sequence_name(user_name, track_name, path_no)  # sequence name
        course_list = generate_course_list(sequence_name, category_data['category_list_cln']) # course list

        # writing sequence / learning path to database
        add_course_to_sequence.add_courses_to_sequence(import_params.driver, '0', sequence_name, '0', track_name, course_list, category_data['relationship_list'], user_name)

        # path json object
        sequence_data = {
            'sequence_id' : '0',
            'sequence_name' : sequence_name,
            'track_id' : '0',
            'track_name' :  track_name,
            'master_list' : course_list,
            'relationship_list' : category_data['relationship_list'],
            'username' : user_name
        }

        # save path object locally
        write_sequence_to_json(sequence_data)

if __name__== "__main__":
  main()
