# script to convert json to csv file for easy viewing
import pandas as pd

json_df = pd.read_json('./scraped_data/moocdataV4.json')
json_df.to_csv('./scraped_data/moocdataV4.csv')
