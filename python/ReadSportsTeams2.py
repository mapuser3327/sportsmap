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

    #<li class="d3-o-footer__panel-link-category">\nNFC West          </li>
    # \n\n              <li>\n\n    <a href="https://www.azcardinals.com/"\n       target="_blank"\n       data-link_module="Footer"\n       data-event_name="click action"\n       data-link_type="_all-teams"\n       data-link_name="Arizona Cardinals"\n       data-link_url="https://www.azcardinals.com"\n       data-link_position="1:4">\n<picture><!--[if IE 9]><video style="display: none; "><![endif]--><source data-srcset="https://static.www.nfl.com/league/api/clubs/logos/ARI.svg" media="(min-width:1024px)" /><source data-srcset="https://static.www.nfl.com/league/api/clubs/logos/ARI.svg" media="(min-width:768px)" /><source data-srcset="https://static.www.nfl.com/league/api/clubs/logos/ARI.svg" /><!--[if IE 9]></video><![endif]--><img alt="Arizona Cardinals" class="img-responsive d3-o-footer__panel-icon" data-src="https://static.www.nfl.com/league/api/clubs/logos/ARI.svg" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" /></picture>    </a>

    #pattern = r'<img alt="(.+?)".+?src=".+?clubs/logos/(.+?).svg".+?/>'

    strippedContent = re.sub(r'\s+', ' ', content)

    pattern = r'<a.+?data-link_module="Footer".+?data-link_type="_all-teams".+?data-link_name="(.+?)".+?data-link_url="(.+?)".+?>.+?<source data-srcset=".+?logos.{1}(.+?)".+?</a>'

    if sport=="nba":
        pattern = r'<a href="(.+?)" class="Anchor_anchor__cSc3P NavTeamList_ntlTeam__9K_aX".+?data-text="(.+?)".+?<img src="https://cdn.nba.com/logos/nba/(.+?)/primary/L/logo.svg".+?</a>'

    elif sport=="mlb":
        #pattern = r'<a href="(.+?)".+?data-sub-nav-name="(.+?)".+?data-parent="Teams".+?".+?logos.{1}(.+?)".+?</a>'
        pattern = r'<a href="(.+?)" class="header__subnav__item header__subnav--teams__team".+?data-sub-nav-name="(.+?)".+?data-parent="Teams".+?src=".+?team-logos.{1}(.+?)".+?</a>'
    elif sport=="nhl":
        pattern = r'<a.+?class="nhl-c-team-menu__logo" href="(.+?)".+?<img alt="(.+?) logo".+?src="https://assets.nhle.com/logos/nhl/svg/(.+?)_dark(.+?)</a>'

    elif sport=="mls":
        pattern = r'<picture class="d3-o-media-object__picture">.+?<img alt=".+?(v[0-9]{10}).+?title="(.+?)".+?</img>.+?href="/clubs/(.+?)".+?</a>'
        #pattern = r'<picture class="d3-o-media-object__picture">.+?<img alt="(.+?)".+?src=".+?t_q-best(.+?)/assets/logos/(.+?)-Logo.+?"(.+?)</a>'

    print(pattern)
    #pattern = r'<img([\w\W]+?)/>'
    #pattern = r'<img([\w\W]+?)</img>'
    #pattern = r'<img src=".+?logos/nba/(.+?)/primary.+?" title="(.+?) Logo".+?/>'
    # pattern = r'<img alt="(.+?)[ ^.][\w]+?".+?([\d]{3}).+?/>'
    # Find all matches using re.findall()
    matches = re.findall(pattern, strippedContent)

    # Print the extracted strings
    for match in matches:
       # print(match)

       if "/news" not in match[0] and " class" not in match[0]:
           team_code = match[2]
           if team_code.endswith('.svg'):
               team_code = team_code[:-4]
           if sport =="nfl":
               data_map[match[0]] = team_code+","+match[1]
           elif sport == "mlb":
               data_map[match[1]] = team_code + ",https://www.mlb.com/"+match[0]
           elif sport == "nba":
               data_map[match[1]] = team_code + ",https://www.nba.com/" + match[0]
           elif sport == "nhl":
               team_name = match[1]
               if "Canadiens" in team_name:
                   team_name="Montreal Canadiens"
               data_map[team_name] = team_code + "," + match[0]
           elif sport=="mls":
               team_code = match[0]
               team_name = match[1]
               if "v1668018026" == match[0]:
                   team_name = "Montreal"
               data_map[team_name] = team_code + ",https://www.mlssoccer.com/clubs/" + match[2]


    return data_map

def print_data(name, sport_fields, data_map):
    print("--------------------------------------------")
    print(name)
    for key, value in data_map.items():
        if key in sport_fields:
            print(f"{key} = {value}")


if __name__ == "__main__":
    sports = ["nfl","mlb","nba","nhl","mls"]
    #sports = ["mls"]
    file_path = r"C:\test\sportsmap\data\teams2.csv"
    sports_data = {}
    for sport in sports:
        data_map = get_data_from_url(sport)
        sports_data[sport] = data_map

    #
    with open(file_path, "w") as file:
        for sport, data in sports_data.items():
            for key, value in data.items():
                file.write(sport+","+key+","+value+"\n")