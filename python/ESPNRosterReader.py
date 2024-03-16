import csv

import requests
import re
import pandas as pd
import numpy as np
from io import StringIO

def get_data_from_url(sport, team_short_name, team_long_name):
    api_url ="https://www.espn.com/{0}/team/roster/_/name/{1}/{2}".format(sport,
                                                                          team_short_name, team_long_name.replace(" ","_"))
    print(api_url)
    headers = {'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.example.com'}
    response = requests.get(api_url, headers=headers)

    lines = []
    if response.status_code == 200:
       content = response.text

       strippedContent = re.sub(r'\s+', ' ', content)
       pattern = "(<td.*?>)(.*?)</td>"
       matches = re.findall(pattern, strippedContent)
       line=","+team_long_name

       index = -1
       espn_headshot=""
       # Print the extracted strings
       for match in matches:
           #print(match[0])
           orig = match[1]
           index = index + 1
           #print(orig)
           #value = re.sub(r"<[^>]*>", '', orig)
           if re.search('class="inline Table__TD--headshot"', orig):
                #print("=========================================")
                if index > 0:

                    ms = re.findall("([0-9]*)[.][a-z]{3,4}$",espn_headshot)
                    espn_id=""
                    if len(ms) > 0:
                        espn_id = ms[0]

                    lineStripped = re.sub(r"[,]{2,}", ',', line)
                    lineStripped += espn_id+","+espn_headshot
                    lineStripped = lineStripped[1:]
                    lines.append(lineStripped)
                    #print(lineStripped)
                    index = 0
                line=","+team_long_name+","

           if re.search("<[^>]*>", orig):
               strippedvalue = re.sub(r"<[^>]*>", '`', orig)
               if "," in strippedvalue:
                   #print(strippedvalue);
                   strippedvalue = re.sub(r",", '_', strippedvalue)  # value should not have commas
                   #print(strippedvalue);
               p2 = r"<a[^>]*href=\"([^\"]+)\"[^>]*>(.*?)</a>"
               m2 = re.search(p2, orig)
               if m2:
                   # player_name, player_no
                  tempvalue = re.sub(r"[`]{1,}", ',', strippedvalue)
                  #print(tempvalue)
                  if tempvalue !=',':
                    splits = tempvalue[1:-1].split(",")
                    if len(splits)==1:
                        tempvalue+='-,'
                    value = tempvalue+"`"+m2.group(1)  # Return the captured href value (group 1)
                    #print(value)
               else:
                  value = strippedvalue

               p3 = r'<div class="headshot.*?<img alt="(.*?)"'
               m3 = re.search(p3, orig)
               if m3:
                   value =  m3.group(1)

           else:
               value = orig



           valueStripped =  re.sub(r"[`]{1,}", ',', value)
           valueStripped = valueStripped.strip()
           if valueStripped == '':
               valueStripped = '-'

           valueStripped= re.sub(r"&#x27;", '\'', valueStripped)
           valueStripped = re.sub(r"&quot;", '\"', valueStripped)
           valueStripped = re.sub(r"&amp;", '&', valueStripped)
           if index>0 :
               line+=valueStripped
           else:
               espn_headshot = valueStripped
    else:
        print("bad request: ")
    if len(lines) == 0:
        print("Something wrong for "+team_long_name)

    return lines

if __name__ == "__main__":

    sports = ["nfl", "mlb", "nba", "nhl", "mls"]
    sport = "nhl"
    df = pd.read_csv(r"C:\test\sportsmap\data\teams.csv")
    #sorted_sport = df[df['sport'] == sport].head(1)
    sorted_sport = df[df['sport'] == sport]
    header_dict = {
        "nfl": "Team_Name,Player_Name,Player_No,espn_url,Position,Age,Height,Weight,Years_Experience,College,espn_id,espn_headshot",
        "mlb": "Team_Name,Player_Name,Player_No,espn_url,Position,Bat,Throws,Age,Height,Weight,HomeTown_City,HomeTown_ST_COUNTRY,espn_id,espn_headshot",
        "nba": "Team_Name,Player_Name,Player_No,espn_url,Position,Age,Height,Weight,College,Salary,espn_id,espn_headshot",
        "nhl": "Team_Name,Player_Name,Player_No,espn_url,Age,Height,Weight,Shot,HomeTown,BirthDate,espn_id,espn_headshot",
        "mls": "Team_Name,Player_Name,Player_No,espn_url,Position,Age,Height,Weight,College,Salary,espn_id,espn_headshot"
    }

    file_path = r"C:\test\sportsmap\data\{0}rosters.csv".format(sport)
    headers = header_dict[sport].split(",");
    #print(headers)
    tindex = 1;
    combined_df = pd.DataFrame(columns=headers)

    for index, row in sorted_sport.iterrows():

        str = "{0}. {1} {2}".format(tindex, sport, row['team_name'])
        print(str)
        tindex = tindex + 1

        team_code = row["team_code_alt"]
        lines = get_data_from_url(row['sport'],team_code,row['team_name'])

        data = '\n'.join(lines)
        stringio = StringIO(data)
        tempdf = pd.read_csv(StringIO(data), names=headers, quoting=csv.QUOTE_NONE)
        #dfArray.append(tempdf)
        combined_df = pd.concat([combined_df, tempdf], axis=0, ignore_index=True)

    #final_df = pd.merge(combined_df, sorted_sport, left_on='Team_Name', right_on='team_name')
    #final_df = sorted_sport.combine_first(combined_df)
    combined_df.to_csv(file_path, index=False)
