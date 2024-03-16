import requests
import pandas as pd
import re
def get_birth_info_from_wikipedia(person_name, sports_fields):
    api_url = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=revisions&titles=" + person_name + "&rvprop=content"
    response = requests.get(api_url)
    data_map = {}
    if response.status_code == 200:
        content = response.json()
        page_id = next(iter(content['query']['pages']))
        try:
            page_content = content['query']['pages'][page_id]['revisions'][0]['*']
            for info in page_content.split("\n|"):
                info =  "|".join(info.split("\n"))

                match1 = re.search("(?i)(espn\s*=.*?)\|", info)
                match3 = re.search("(?i)(headshot.*?)", info)
                match2 = re.search("(?i)(pfr\s*=.*?)\|", info)
                if match1:
                   info = match1.groups()[0]
                   #print("a " +info)
                elif match2:
                    # info = info[info.index("espn="):]
                    info = match2.groups()[0]
                    #print(info)
                # elif match3:
                #     print(info)
                keys = info.split("=", 1)

                if len(keys) > 1 :
                   # print(keys[0]+ "====" + keys[1])
                    k = keys[0].strip()
                    if "statvalue" in k:
                        k = k.replace("value","label")
                    for element in sports_fields:
                        if element["field"] == k:

                            v = keys[1].replace("[", "")
                            v = v.replace("]", "")
                            v = v.replace("{", "")
                            v = v.replace("}", "")
                            v = v.replace("|mf=y", "")
                            v = v.replace("nowrap", "")
                            v = v.replace(",", "")
                            v = v.replace("Birth date and age|", "")
                            v = v.replace("birth date and age|", "")
                            data_map[element["label"]] = str(v.strip())
                            #print(" => {0} === {1}".format(element["label"],v))
        except Exception as e:
            print("Error")
    #print(data_map.keys())
    #print(data_map);
    return data_map

def print_data(name, sport_fields, data_map):
    print("--------------------------------------------")
    print(name)
    pd.DataFrame.from_dict(data_map,orient='index', index=sport_fields);
    print(pd)
    # for key, value in data_map.items():
    #     if key in sport_fields:
    #         print(f"{key} = {value}")


if __name__ == "__main__":
    nfl_fields = [
        {"field": "current_team", "label": "Current_Team"},
        {"field": "number", "label": "Player_No"},
        {"field": "espn", "label": "ESPN_ID"},
        {"field": "position", "label": "Position"},
        {"field": "status", "label": "status"},
        {"field": "pfr", "label": "PRO_FOOTBALL_REFERENCE"},
        {"field":"birth_date","label":"Birth_Date"},
        {"field":"birth_place","label":"Birth_Place"},
        {"field": "death_date", "label": "Death_Date"},
        {"field": "death_place", "label": "Death_Place"},
        {"field":"college","label":"College"},
        {"field":"high_school","label":"High_School"},

        {"field":"draftpick","label":"Draft_Pick"},
        {"field":"draftround","label":"Draft_Round"},
        {"field":"draftyear","label":"Draft_Year"},

        {"field": "pastteams", "label": "Past_Teams"},

        {"field": "statseason", "label": "statseason"},
        {"field": "statweek", "label": "statweek"},
        {"field":"statlabel1","label":"statlabel1"},
        {"field":"statvalue1","label":"statvalue1"},
        {"field":"statlabel2","label":"statlabel2"},
        {"field":"statvalue2","label":"statvalue2"},
        {"field":"statlabel3","label":"statlabel3"},
        {"field":"statvalue3","label":"statvalue3"},
        {"field":"statlabel4","label":"statlabel4"},
        {"field":"statvalue4","label":"statvalue4"},
        {"field":"statlabel5","label":"statlabel5"},
        {"field":"statvalue5","label":"statvalue5"},
        {"field":"statlabel6","label":"statlabel6"},
        {"field":"statvalue6","label":"statvalue6"},
        {"field":"statlabel7","label":"statlabel7",},
        {"field":"statvalue7","label":"statvalue7"},
        {"field":"statlabel8","label":"statlabel8"},
        {"field":"statvalue8","label":"statvalue8"},
        {"field":"height_ft","label":"height_ft"},
        {"field":"height_in","label":"height_in"},
        {"field":"weight_lbs","label":"Weight"},
        {"field":"dash","label":"Dash"},
        {"field": "shuttle", "label": "shuttle"},
        {"field": "cone drill", "label": "cone_drill"},
        {"field":"ten split","label":"Ten_split"},
        {"field":"twenty split","label":"twenty_split"},
        {"field":"vertical","label":"vertical"},
        {"field":"broad ft","label":"broad_ft"},
        {"field":"broad in","label":"broad_in"},
        {"field":"arm span","label":"arm_span"},
        {"field":"hand span","label":"hand_span"},
       # {"field":"wonderlic","label":"wonderlic"},

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

    players = ["Kyler Murray"]

    df = pd.read_csv("../data/nflrosters.csv")
    #players_array = df.iloc[:, 1]
    # for player in players_array:
    #     print(player)
    names = [item["label"] for item in nfl_fields]
    playerDict = {}
    index = 0;
    with open('../data/nflRostersDetails2.csv', 'w') as file:
        file.write("{0},{1}\n".format("Player_Name", ",".join(names)))
        for player in players:
            index = index+1
            p = player.replace(" ","_")
            data = get_birth_info_from_wikipedia(player, nfl_fields)
            # if data is not None :
            #     playerDict[player] = data
            # else :
            #     print(player)
            if data is not None :
                value = data
                print("{0}. {1}".format(index,player))
                values = []
                for name in names:
                    val = "" if name not in value else value[name]
                    values.append(val)
                #print("{0},{1}".format(key, ",".join(values)))
                try:
                    file.write("{0},{1}\n".format(player, ",".join(values)))
                except Exception as e:
                    print(e)
