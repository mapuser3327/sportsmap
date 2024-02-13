import requests
import json
# https://www.nfl.com/teams/arizona-cardinals/roster
def get_nfl_roster(file, team_id):
    api_url = f"https://www.nfl.com/teams/arizona-cardinals/roster"
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
   file_path = "c://data/nflRosters.js"
 # open file, create new file, and apend
 # loop through team ids
   teams = ["arizona-cardinals"]
 # call below, with file, pass team id
   with open(file_path, "a") as file:
       for team in teams:
          data_map = get_nfl_roster(file, team)

# {"spurs" => 1610612759}
# 3
# :
# {"rockets" => 1610612745}
# 4
# :
# {"mavericks" => 1610612742}
# 5
# :
# {"grizzlies" => 1610612763}
# 6
# :
# {"bulls" => 1610612741}
# 7
# :
# {"bucks" => 1610612749}
# 8
# :
# {"timberwolves" => 1610612750}
# 9
# :
# {"pelicans" => 1610612740}
# 10
# :
# {"jazz" => 1610612762}
# 11
# :
# {"thunder" => 1610612760}
# 12
# :
# {"heat" => 1610612748}
# 13
# :
# {"hornets" => 1610612766}
# 14
# :
# {"pacers" => 1610612754}
# 15
# :
# {"pistons" => 1610612765}
# 16
# :
# {"cavaliers" => 1610612739}
# 17
# :
# {"magic" => 1610612753}
# 18
# :
# {"wizards" => 1610612764}
# 19
# :
# {"76ers" => 1610612755}
# 20
# :
# {"raptors" => 1610612761}
# 21
# :
# {"knicks" => 1610612752}
# 22
# :
# {"nets" => 1610612751}
# 23
# :
# {"kings" => 1610612758}
# 24
# :
# {"trailblazers" => 1610612757}
# 25
# :
# {"clippers" => 1610612746}
# 26
# :
# {"lakers" => 1610612747}
# 27
# :
# {"suns" => 1610612756}