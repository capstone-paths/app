
"""
Program allows interactively building a learning path which is written to a Neo4j instance as defined in .env file.

"""
import sys
import os
# add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from neo4j import GraphDatabase
from db_conn import import_params # import neo4j driver, credentials
import uuid

# function checks if a user with a given username exists in the database
def check_if_user_exists(driver,user_name):
        with driver.session() as session:
            return session.run("MATCH (u:User) "
                               "WHERE toLower(u.username) = $user_name "
                               "RETURN id(u)", user_name=user_name.strip().lower())

# function gets a sample of users from the database
def get_some_users(driver, no_users = 5):
        with driver.session() as session:
            return session.run("MATCH (u:User) "
                               "RETURN u.username as username LIMIT $no_users", no_users = no_users)

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
def get_course(driver,course_name):
        with driver.session() as session:
            return session.run("MATCH (c:Course) "
                               "WHERE toLower(c.name) CONTAINS $course_name "
                               "RETURN c.name as name, c.courseID as courseID", course_name=course_name.strip().lower())

# function creates a sequence node
def create_sequence(driver, sequence_name, sequence_id):
        with driver.session() as session:
            return session.run("MERGE (s:PathStart { pathID : $sequence_id,  name : $sequence_name }) "
                               "RETURN id(s)", sequence_id=sequence_id, sequence_name=sequence_name.strip())

# function creates a track node
def create_track(driver, track_name, track_id):
        with driver.session() as session: # using merge so that it will be created only if it does not exists
            return session.run("MERGE (t:Track { trackID : $track_id,  name : $track_name }) "
                               "RETURN id(t)", track_name=track_name.strip(), track_id=track_id)

# function to add input courses to sequence
def add_courses_to_sequence(driver, sequence_id, sequence_name, track_id, track_name, course_list, relationship_pair_list, user_name):
        no_nodes = len(course_list) # get number of nodes, pos=0 being sequence and len -1 will have track node

        with driver.session() as session:

            tx = session.begin_transaction() # open transaction to allow committing multiple transactions at a time

            create_sequence(driver, sequence_name, sequence_id)
            create_track(driver, track_name, track_id)
            for pair_no, relationship in enumerate(relationship_pair_list):
                if (relationship[0] == 0):
                    tx.run("MATCH (a:PathStart {pathID:$sequence_id}) "
                                       "MATCH (b:Course { courseID : $course_id}) "
                                       "WITH a,b "
                                       "MERGE (a)-[:NEXT {pathID:$sequence_id}]->(b)"
                                       "RETURN id(a)", sequence_id=sequence_id, course_id=course_list[relationship[1]])

                elif (relationship[1] == (no_nodes-1)): #check if tracknode
                    tx.run("MATCH (a:Course {courseID:$start_course_id}) "
                                       "MERGE (b:PathStart{pathID:$sequence_id})-[:BELONGS_TO]->(t:Track{name:$track_name}) "
                                       "WITH a,t "
                                       "MERGE (a)-[:NEXT {pathID:$sequence_id}]->(t)"
                                       "RETURN id(a)", sequence_id=sequence_id, start_course_id=course_list[relationship[0]], track_name=course_list[relationship[1]])
                else:
                    tx.run("MATCH (a:Course {courseID:$start_course_id}), (b:Course { courseID : $end_course_id}) "
                                       "WITH a,b "
                                       "MERGE (a)-[:NEXT {pathID:$sequence_id}]->(b)"
                                       "RETURN id(a)", sequence_id=sequence_id, start_course_id=course_list[relationship[0]],
                                       end_course_id=course_list[relationship[1]])


            # link user to learning path /sequence
            tx.run("MATCH (u:User), (s:PathStart) "
                               "WHERE toLower(u.username) = toLower($user_name) "
                               "and s.pathID = $sequence_id "
                               "WITH u,s "
                               "MERGE (u)-[:CREATED]->(s) "
                               "RETURN id(u)", user_name=user_name.strip().lower(), sequence_id=sequence_id )

            tx.commit() # committing transaction

            print("\nLearning Path created Successfully!!")
            print("Learning Path : {0} with pathID = {1} belonging to Track : {2} was Successfully created by user : {3}".
            format(sequence_name, sequence_id, track_name, user_name))

            print("\n")
            print("Run the below query in the Neo4j Browser to view the results")
            print("===========================================================================================================================================")
            print("match(u:User)-[]-(s:PathStart{pathID:'" + str(sequence_id) + "'})-[r:NEXT*{pathID:'" + str(sequence_id) + "'}]-(c:Course)-[cr:NEXT*{pathID:'" + str(sequence_id) + "'}]-(t:Track)-[b:BELONGS_TO]-(p) return u,s,r,c,cr,t,b,p")
            print("===========================================================================================================================================")
            return True

# function gets sequence name from user
def get_sequence_info(sequence_data):
    # get sequence name from user
    sequence_name = input("Enter name of sequence (node : PathStart) : ")

    #check if sequence already exits
    if check_if_sequence_exists(import_params.driver, sequence_name).single():
        print('Sequence/Path "{0}" already exists'.format(sequence_name))
        exit(0)
    else:
        sequence_data['sequence_name'] = sequence_name #capture sequence name
        current_max_sequence_id = get_max_sequence_id(import_params.driver).single()
        sequence_data['sequence_id'] = int(current_max_sequence_id.value()) + 1


# function gets track name from user
def get_track_info(sequence_data):
    # get track name from user
    track_name = input('Enter track name to which sequence/path "{0}" belongs : '.format(sequence_data['sequence_name']))

    #check if track already exits
    track_n = check_if_track_exists(import_params.driver, track_name).single()
    if ( track_n ):
        print('Track "{0}" already exists. Attaching sequence "{1}" to Track "{0}" '.format(track_name, sequence_data['sequence_name']))
        sequence_data['track_name'] = track_n.value(0) #capture track name returned from db
        sequence_data['track_id'] = track_n.value(1)
    else:
        sequence_data['track_name'] = track_name # capture input track name
        current_max_track_id = get_max_track_id(import_params.driver).single()
        sequence_data['track_id'] = str(int(current_max_track_id.value()) + 1)


# function gets user name from user
def get_user_info(sequence_data):
    user_name = input("Enter user name of user creating the Learning Path : ")

    #check if user already exits
    if check_if_user_exists(import_params.driver, user_name).single():
        sequence_data['username'] = user_name #capture user name
        current_max_sequence_id = get_max_sequence_id(import_params.driver).single()
        sequence_data['sequence_id'] = str(int(current_max_sequence_id.value()) + 1)
        print('Success! User with user name "{0}" already exists'.format(user_name))
        return True
    else:
        print('User with user name "{0}" does not exist'.format(user_name))
        users = get_some_users(import_params.driver)
        print('Sample of users in the database...')
        for i,u in enumerate(users):
            print(i+1,'.', u.get('username'))
        return False

# function check if result has records
def isResultRecord(results):
    if results.peek() == None:
        return False
    else:
        return True

# function gets course list for the sequence
def get_course4sequence(sequence_data):
    course_list = []     # list to hold courses
    course_id_list = []  # list to hold course id
    cont = 'y'           # continue getting courses

    course_counter = 1

    while (cont.lower() == 'y'):
        print("\n")
        course = input('Enter {0} course or keyword : '.format(course_counter))

        recs = get_course(import_params.driver,course)
        tempCourseList = []      # hold course till final
        tempCourseIDList = []    # hold course ids till final

        #print(recs.values()[0])

        if ( isResultRecord(recs) ):
            for i,r in enumerate(recs):
                print(i+1,'.', r.get('name'))
                tempCourseList.append(r.get('name'))
                tempCourseIDList.append(r.get('courseID'))

            course_choice = input('Enter Choice, course # : ')
            assert int(course_choice) >= 1 and int(course_choice)<= i+1, 'invalid course choice, rolling back, restart'
            course_list.append(tempCourseList[int(course_choice)-1])
            course_id_list.append(tempCourseIDList[int(course_choice)-1])
        else:
            print('There is no course with keyword "{0}"'.format(course))
            continue

        cont = input ("continue? y or n : ")       # continue getting courses ?
        course_counter += 1

    sequence_data['course_list'] = course_list.copy()
    sequence_data['course_id_list'] = course_id_list.copy()

    # store path name, course names, track names and id's
    master_list_display = [sequence_data['sequence_name'] + '(PathStart / Start Node)'] + sequence_data['course_list'] + [sequence_data['track_name'] + '(Track / End Node)']
    master_list = [sequence_data['sequence_name'] ] + sequence_data['course_id_list'] + [sequence_data['track_name'] ]

    sequence_data['master_list'] = master_list.copy()
    sequence_data['master_list_display'] = master_list_display.copy()


# function gets relationship for courses in the sequence
def get_relationships(sequence_data):
    print("Let's Build relationship between courses.......")

    print("Courses added to the list and their index : \n")
    for i, course in enumerate(sequence_data['master_list_display']):
        print(i, course)

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


        if (len(rel_item)<2):
            valid = 'n' # repeat process
        elif (rel_item[1] != i):
            print("Last Node entered was not the  Track Node index, restarting...") #invalid repeat
        else:
            valid = 'y' #marking completion

    sequence_data['relationship_list'] = relationship_list.copy()


def main():
    sequence_data = {} #dict to hold sequence attributes
    while True:
        # get sequence name
        get_sequence_info(sequence_data)

        # get track name
        get_track_info(sequence_data)

        # get user name from user
        while True:
            if ( get_user_info(sequence_data) ):
                break

        # get courses for the sequence
        get_course4sequence(sequence_data)

        # get relationships among courses in sequence
        get_relationships(sequence_data)
        print(sequence_data)

        # writing sequence / learning path to database
        add_courses_to_sequence(import_params.driver, sequence_data['sequence_id'], sequence_data['sequence_name'] , sequence_data['track_id'], sequence_data['track_name'], sequence_data['master_list'], sequence_data['relationship_list'] ,sequence_data['username'] )

        conti = input("Do you want to input another sequence? [y or n] ")
        if ( conti == 'n' ):
            break


if __name__== "__main__":
  main()
