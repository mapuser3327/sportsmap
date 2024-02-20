import requests
import re
def get_data_from_url(sport):

    api_url = "https://www.nfl.com/teams"
    if (sport == "mlb") :
        api_url = "https://www.mlb.com/team"
    elif (sport == "nba") :
        api_url = "https://www.nba.com/teams"
    elif (sport== "nhl") :
        api_url = "https://www.nhl.com/teams"
    elif (sport == "mls"):
        api_url = "https://www.mlssoccer.com/clubs"
    print(api_url)
    response = requests.get(api_url)
    data_map = {}
    if response.status_code == 200:

        content = response.text
    # Regular expression pattern to match the desired img tag structure
    # pattern = r"<img src=\"(.)*\.logo\.svg\" .*?/>"
    pattern = r'<img alt="(.+?)".+?src=".+?clubs/logos/(.+?).svg".+?/>'
    if sport=="nba":
        pattern = r'<img src=".+?logos/nba/(.+?)/primary.+?" title="(.+?) Logo".+?/>'
    elif sport=="mlb":
        pattern = r'<img alt="(.+?)[ ^.][\w]+?".+?([\d]{3}).+?/>'
    elif sport=="nhl":
        pattern = r'<img alt="(.+?)[ ^.][\w]+?".+?([A-Z]{3}).+?</img>'
    elif sport=="mls":
        pattern = r'<img alt="(.+?)".+?(v{1}[\d]{10}.+?)".+?</img>'
    print(pattern)
    #pattern = r'<img([\w\W]+?)/>'
    #pattern = r'<img([\w\W]+?)</img>'
    #pattern = r'<img src=".+?logos/nba/(.+?)/primary.+?" title="(.+?) Logo".+?/>'
    # pattern = r'<img alt="(.+?)[ ^.][\w]+?".+?([\d]{3}).+?/>'
    # Find all matches using re.findall()
    matches = re.findall(pattern, content)

    # Print the extracted strings
    for match in matches:
        #print(match)
        if (sport == "mlb" and match[0].find("Team") > -1):
            continue;

        if (sport=="nba"):
            data_map[match[1]] = match[0]
        else:
            if sport=="nhl" and match[0].find("Canadiens") > -1:
                data_map["Montreal Canadiens"]=match[1]
            elif sport=="mls":
                data_map[match[0]] = "/"+ match[1]
            elif match[0]!='MLB' and match[0]!='NHL':
                data_map[match[0]]=match[1]
    return data_map

def print_data(name, sport_fields, data_map):
    print("--------------------------------------------")
    print(name)
    for key, value in data_map.items():
        if key in sport_fields:
            print(f"{key} = {value}")


if __name__ == "__main__":
    sports = ["nfl","mlb","nba","nhl","mls"]

    file_path = r"C:\test\sportsmap\data\teams.csv"
    sports_data = {}
    for sport in sports:
        data_map = get_data_from_url(sport)
        sports_data[sport] = data_map


    with open(file_path, "w") as file:
        for sport, data in sports_data.items():
            for key, value in data.items():
                file.write(sport+","+key+","+value+"\n")