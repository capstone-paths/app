'''
Program is a wrapper to
1. Verify .env file if it exits or create .env file
2. Wipe database clean
'''
from db_conn import veri_env


# verifying .env file which has database credentials
def verify_env_status():
    return veri_env.check_env()

def main():
    # verifying .env file which has database credentials
    print("\n")
    status = verify_env_status()
    print("\n")

    if (status):                                     # successfully verified connection to database
        from wipe_data import wipe_data              # lazy loading modules
        from course_loader import course_loader
        from custom_tags import load_custom_tags     # load custom tags
        from user_skills import load_skills          # load custom  skills
        from read_query import load_cypher_query
        from load_path_jsons import load_path_jsons  # load learning paths
        from mock_users import load_users        # load mock users

        wipe_data.delete_database()                  # wipe clean database if needed
        print("\n")
        course_loader.load_scraped_courses_data()    # load course from scrapped json data
        print("\n")
        load_custom_tags.load_custom_tags_for_courses()    # load course tags
        print("\n")
        load_skills.load_user_skills()               # load skills
        print("\n")
        load_cypher_query.process_query_file()       # load sequences from file
        print("\n")
        load_path_jsons.load_path_jsons()            # load path jsons
        print("\n")
        load_users.load_mock_user()                  # load path jsons
        print("\n")



    else:
        print("Verify db_conn/.env file for connection information.")


if __name__== "__main__":
  main()
