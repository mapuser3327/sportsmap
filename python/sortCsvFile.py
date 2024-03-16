import requests
import re
import pandas as pd
import numpy as np

df1 = pd.read_csv(r"C:\test\sportsmap\data\teams_old.csv")
df2 = pd.read_csv(r"C:\test\sportsmap\data\teams.csv")
#combined_df = pd.merge(df1, df2, on=['sport','team_name'])
combined_df = df1.combine_first(df2)
sorted_nfl = combined_df.sort_values(by=['sport','team_name'])

for index, row in sorted_nfl.iterrows():
   team_code_alt = row['team_code_alt']
   if row['team_code_alt'] is not np.nan:
       team_code_alt= team_code_alt.lower()
   elif row['sport'] == 'nfl':
       team_code_alt = row['team_code'].lower()
   else:
       team_code_alt = row['team_name'][:3].lower()

   row['team_code_alt'] = team_code_alt

sorted_nfl.to_csv(r"C:\test\sportsmap\data\teams_combined_sorted.csv", index=False)

