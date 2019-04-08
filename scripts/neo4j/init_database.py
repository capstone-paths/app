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
        from read_query import load_cypher_query

        wipe_data.delete_database()                  # wipe clean database if needed
        print("\n")
        course_loader.load_scraped_courses_data()    # load course from scrapped json data
        print("\n")
        load_cypher_query.process_query_file()       # load sequences from file
        print("\n")

    else:
        print("Verify db_conn/.env file for connection information.")


if __name__== "__main__":
  main()
