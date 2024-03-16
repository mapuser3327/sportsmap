export const getDataMap = (headers, values) => {
  const data = new Map();
  headers.forEach((header, index) => {
    // Retrieve value using index from values array
    const value = values[index];
    // Set key-value pair on the map using header name
    data.set(header.trim(), value.trim());
  });
  return data;
};

export const formatVal = (value, appendValue) => {
  let val = value.toLowerCase().replace(/ /g, "-");
  if (appendValue != null) {
    val += "-" + appendValue.replace(/ /g, "-");
  }
  return val;
};

export const addTeamToData = (allTeamsMap, headers, line) => {
  const values = line.split(",");
  const datamap = getDataMap(headers, values);
  let sportMap = allTeamsMap.get(datamap.get("sport"));
  if (sportMap == null) {
    sportMap = new Map();
  }
  const teamKey = formatVal(datamap.get("team_name"));
  sportMap.set(teamKey, datamap);
  //console.log(sportMap.get(teamKey));
  allTeamsMap.set(datamap.get("sport"), sportMap);
};

export const loadTeams = (sports) => {
  const allTeamsMap = new Map();
  sports.forEach((sport) => {
    allTeamsMap.set(sport, new Map());
  });
  fetch("../data/teams.csv")
    .then(function (response) {
      return response.text();
    })
    .then(function (text) {
      const lines = text.split("\n");
      const headers = lines[0].split(",");

      for (var i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === "") continue;
        addTeamToData(allTeamsMap, headers, line);
      }
      console.log(allTeamsMap.get("nfl"));
      console.log(allTeamsMap.get("nba"));
    })
    .catch(function (err) {
      // Error handling goes here (e.g. the network request failed, etc)
      console.log(err);
    });
  return allTeamsMap;
};

export const getTeamUrl = (index, teamid) => {
  const urls = [
    `https://static.www.nfl.com/t_q-best/league/api/clubs/logos/${teamid}`,
    `https://cdn.nba.com/logos/nba/${teamid}/primary/L/logo.svg`,
    `https://www.mlbstatic.com/team-logos/${teamid}.svg`,
    `https://assets.nhle.com/logos/nhl/svg/${teamid}_light.svg`,
    `https://images.mlssoccer.com/image/upload/t_q-best${teamid}`,
  ];

  return urls[index];
};
