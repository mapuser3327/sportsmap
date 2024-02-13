import json
import urllib.request
def get_birth_info_from_wikipedia(person_name):
    api_url = "https://bdfed.stitch.mlbinfra.com/bdfed/stats/player?stitch_env=prod&season=2023&sportId=1&stats=season&group=hitting&gameType=R&limit=25&offset=0&sortStat=homeRuns&order=desc&teamId=109"
    with urllib.request.urlopen(api_url) as response:
        data = json.loads(response.read().decode())
        content = data["query"]["pages"][list(data["query"]["pages"].keys())[0]]["revisions"][0]["*"]
        data_map = {}
        for info in content.split("\n|"):
            keys = info.split("=", 2)
            if len(keys) > 1:
                data_map[keys[0].strip()] = keys[1].strip()
        return data_map

def print_data(name, sport_fields, data_map):
    print("--------------------------------------------")
    print(name)
    for key, value in data_map.items():
        if key in sport_fields:
            print(f"{key} = {value}")
nfl_fields = ["birth_date", "birth_place", "college", "high_school", "pastteams", "position", "draftpick", "draftround", "draftyear", "current_team"]
nhl_fields = ["birth_date", "birth_place", "college", "high_school", "pastteams", "position", "draft", "draft_year", "draft_team", "team"]
try:
    for player in ["Patrick_Mahomes"]:
        data_map = get_birth_info_from_wikipedia(player)
        print_data(player, nfl_fields, data_map)
    for player in ["Bryan_Rust", "Sidney_Crosby"]:
        data_map = get_birth_info_from_wikipedia(player)
        print_data(player, nhl_fields, data_map)
except Exception as e:
    print(f"An error occurred: {e}")