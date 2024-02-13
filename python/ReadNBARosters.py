import requests
import json
def get_nba_roster(file, team_id):
    api_url = f"https://www.nba.com/stats/team/{team_id}"
    response = requests.get(api_url)
    data_map = {}
    if response.status_code == 200:
        content = str(response.content)
        start = content.find('"roster":')
        end = content.find('"coaches":')
        roster = content[start:end]
        file.write(roster+"\n")
        # Append Roster to file
        print(roster)
        # page_id = next(iter(content['query']['pages']))
        # page_content = content['query']['pages'][page_id]['revisions'][0]['*']
        # for info in page_content.split("\n|"):
        #     keys = info.split("=", 1)
        #     if len(keys) > 1:
        #         data_map[keys[0].strip()] = keys[1].strip()
    return data_map

def print_data(name, sport_fields, data_map):
    print("--------------------------------------------")
    print(name)
    for key, value in data_map.items():
        if key in sport_fields:
            print(f"{key} = {value}")


if __name__ == "__main__":
   file_path = "c://data/nbaRosters.js"
 # open file, create new file, and append
 # loop through team ids
   teams = [1610612743,1610612737]
 # call below, with file, pass team id
   with open(file_path, "a") as file:
       for team in teams:
          data_map = get_nba_roster(file, team)
