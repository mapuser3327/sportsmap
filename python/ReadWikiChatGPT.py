import requests
def get_birth_info_from_wikipedia(person_name):
    api_url = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=revisions&titles=" + person_name + "&rvprop=content"
    response = requests.get(api_url)
    data_map = {}
    if response.status_code == 200:
        content = response.json()
        page_id = next(iter(content['query']['pages']))
        page_content = content['query']['pages'][page_id]['revisions'][0]['*']
        for info in page_content.split("\n|"):
            keys = info.split("=", 1)
            if len(keys) > 1:
                data_map[keys[0].strip()] = keys[1].strip()
    return data_map

def print_data(name, sport_fields, data_map):
    print("--------------------------------------------")
    print(name)
    for key, value in data_map.items():
        if key in sport_fields:
            print(f"{key} = {value}")


if __name__ == "__main__":
    nfl_fields = [
        "birth_date", "birth_place", "college", "high_school",
        "pastteams", "position", "draftpick", "draftround",
        "draftyear", "current_team"
    ]
    nhl_fields = [
        "birth_date", "birth_place", "college", "high_school",
        "pastteams", "position", "draft", "draft_year",
        "draft_team", "team"
    ]
    nba_fields = [
        "birth_date", "birth_place", "college", "high_school",
        "position", "draft_pick", "draft_round", "draft_year",
        "draft_team", "current_team"
    ]
    mba_fields = [
        "birth_date", "birth_place", "college", "high_school",
        "position", "draft_pick", "draft_round", "teams",
        "debutdate", "debutteam", "current_team"
    ]
    players = ["Patrick_Mahomes"]
    for player in players:
        data_map = get_birth_info_from_wikipedia(player)
        print_data(player, nfl_fields, data_map)