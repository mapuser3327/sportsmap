const teamMaps = [];
const sportsLayerMap = new Map();
const teamMap = new Map();
const sports = ["nfl", "nba", "mlb", "nhl", "mls"];
const allTeamLocations = new Map();
const nflPositions = new Map();
const nflFilterableFields = [
  "season",
  "team",
  "position",
  "status",
  "last_name",
  "college",
];
const nflFilters = new Map();

const initSportsData = () => {
  nbaTeamData = new Map();
  nflTeamData = new Map();
  mlbTeamData = new Map();
  nhlTeamData = new Map();
  mlsTeamData = new Map();
  nflData.weeks[0].standings.forEach((data) => {
    const parts = data.team.fullName.toLowerCase().split(" ");
    const logoParts = data.team.currentLogo.split("/");

    nflTeamData.set(parts[parts.length - 1], logoParts[logoParts.length - 1]);
  });
  teamMaps.push(nflTeamData);

  nbaData.scoreboard.games.forEach((data) => {
    nbaTeamData.set(
      data.awayTeam.teamName.toLowerCase().replace(/ /g, ""),
      data.awayTeam.teamId
    );
    nbaTeamData.set(
      data.homeTeam.teamName.toLowerCase().replace(/ /g, ""),
      data.homeTeam.teamId
    );
  });

  teamMaps[1] = nbaTeamData;

  mlbData.records.forEach((data) => {
    data.teamRecords.forEach((t) => {
      const parts = t.team.name.toLowerCase().split(" ");
      mlbTeamData.set(parts[parts.length - 1], t.team.id);
    });
  });
  teamMaps[2] = mlbTeamData;

  nhlData.standings.forEach((data) => {
    nhlTeamData.set(
      data.teamCommonName.default.toLowerCase().replace(/ /g, ""),
      data.teamAbbrev.default
    );
  });
  teamMaps[3] = nhlTeamData;

  mlsData.forEach((data) => {
    mlsTeamData.set(
      data.club.slug,
      data.club.logoColorUrl.split("{formatInstructions}")[1]
    );
  });
  teamMaps[4] = mlsTeamData;
  console.log(teamMaps);
};

const teamLogos = [
  "https://static.www.nfl.com/image/upload/v1554321393/league/nvfr7ogywskqrfaiu38m.svg",
  "https://cdn.nba.com/logos/leagues/logo-nba.svg",
  "https://www.mlbstatic.com/team-logos/league-on-dark/1.svg",
  "https://media.d3.nhle.com/image/private/t_q-best/prd/assets/nhl/logos/nhl_shield_wm_on_dark_fqkbph",
  "https://images.mlssoccer.com/image/upload/v1665849438/assets/logos/MLS-Crest-FFF-480px_tmwlkh.png",
];

const loadNFLPositions = () => {
  console.log("Loading NFL Positions");

  fetch("../data/NFLPositions.csv")
    .then(function (response) {
      return response.text();
    })
    .then(function (text) {
      const lines = text.split("\n");

      const headers = lines[0].split(",");
      for (var i = 1; i < lines.length; i++) {
        const line = lines[i];
        const values = line.split(",");
        nflPositions.set(values[1], values[0] + "," + values[2]);
      }
      console.log(nflPositions);
    })
    .catch(function (err) {
      // Error handling goes here (e.g. the network request failed, etc)
      console.log(err);
    });
};

const loadNFLRosters = () => {
  console.log("Loading NFL Roster");
  fetch("../data/roster_2023.csv")
    .then(function (response) {
      return response.text();
    })
    .then(function (text) {
      const lines = text.split("\n");
      const headers = lines[0].split(",");
      let playerIndex = headers.indexOf("jersey_number");
      let teamIndex = headers.indexOf("team");
      let statusIndex = headers.indexOf("status");

      for (var i = 1; i < lines.length; i++) {
        const line = lines[i];
        const values = line.split(","); // Buggy, should ignore commas in ""

        setUpFilters("nfl", headers, line);
        const status = values[statusIndex];

        const team = values[teamIndex]; // 3 digit code for NFL team
        let teamData = teamMap.get(team);
        if (!teamData) {
          teamData = new Map();
        }
        const playerNo = values[playerIndex];
        const player = loadPlayerData(headers, values);
        if (status === "RES") continue;
        teamData.set(playerNo, player);
        teamMap.set(team, teamData);
      }
      console.log(teamMap);
      console.log(nflFilters);
    })
    .catch(function (err) {
      // Error handling goes here (e.g. the network request failed, etc)
      console.log(err);
    });
};

function displayMenu(sports) {
  const listNode = document.getElementById("sportsmenu");
  const fragment = document.createDocumentFragment();

  sports.forEach((sport, index) => {
    const li = document.createElement("li");
    li.classList.add("nav-item");
    li.tabIndex = index;
    const a = document.createElement("a");
    a.id = "nav-link-" + sport;
    a.classList.add("nav-link");
    a.classList.add("active");
    //a.classList.add("active");
    a.href = `javascript:changeLayer("${sport}")`;
    a.innerHTML = `<img id="${sport}" width="40px" height="40px" src="${teamLogos[index]}">`;
    li.appendChild(a);
    fragment.appendChild(li);
  });
  listNode.innerHTML = "";
  listNode.appendChild(fragment);
}

const showRoster = (sport, teamName) => {
  const index = sports.indexOf(sport);
  const sportsMap = teamMaps[index];
  const roster = teamMap.get(sportsMap.get(teamName));

  displayResults(teamName, roster);
  $(".panel-side").show();
  // $().addEventListener("click", () => showRoster(sport, teamName));
  $("#mappedEvent").on("change", function () {
    // Get the newly selected value
    let teamLocations = allTeamLocations.get(sport);

    const selectedValue = $(this).val();
    changeLayer("none");
    currentMarkerGroup = L.layerGroup().addTo(map);

    for (const [key, player] of roster.entries()) {
      if (player.get("draft_number")) {
        let latlng = teamLocations.get(player.get("draft_number"));
        let imgUrl =
          player.get("headshot_url")?.replace('"', "") +
          "," +
          player.get("ngs_position")?.replace('"', "");

        if (latlng) {
          let specialIcon = L.Icon.extend({
            options: {
              iconUrl: imgUrl,
              iconSize: [40, 40],
            },
          });

          const marker = L.marker(latlng, {
            icon: new specialIcon(),
          });

          marker.addTo(currentMarkerGroup);

          let rookieTeam = teamName;
          sportsMap.forEach((key, value) => {
            if (key === player.get("draft_number")) {
              rookieTeam = value;
            }
          });

          let text = `<h4> ${player.get("full_name")} </h4>\
          <li>Drafted By: ${rookieTeam} \
          
          <li>Rookie Year: ${player.get("rookie_year")} \
          <li>College: ${player.get("college")} \
          <br>
          <a target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/${player
            .get("full_name")
            .replace(" ", "_")}">Wikipedia</a>
          `;
          let label = `${player.get("full_name")} ${player.get("rookie_year")}`;
          marker.bindPopup(text); // Add a popup with the name of the point
          // marker.bindLabel(label, { noHide: true });
        }
      }
    }
  });
};
const buildPopupContent = (player) => {
  const wikiPlayerName = player.get("full_name").replace(" ", "_");

  const nflPlayerName = player.get("full_name").replace(" ", "-").toLowerCase();

  const imgUrl =
    player.get("headshot_url")?.replace('"', "") +
    "," +
    player.get("ngs_position")?.replace('"', "");

  return `<h4>${player.get("jersey_number")} ${player.get("full_name")}</h4> \
  <table style="border:0px"><tr><td>
  <li>Position: ${player.get("position")} \
  <li>Status: ${player.get("status")} \
  <li>Height: ${player.get("height")}  Weight: ${player.get("weight")} \
  <li>Rookie Year: ${player.get("rookie_year")}  Drafted By: ${player.get(
    "draft_number"
  )}
  <li>College: ${player.get("college")}
  <li>Birth Date: ${player.get("birth_date")}
  <br>
  <a target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/${wikiPlayerName}">Wikipedia</a>
  &nbsp;&nbsp;&nbsp;<a target="_blank" rel="noopener noreferrer" href="https://www.nfl.com/players/${nflPlayerName}">NFL Stats</a>
    </td>
    <td>
    <img src = "${imgUrl}" width="200" height="180">
    </td>
    </tr>
    </table>
  `;
};

const setupHovers = (element) => {
  element.addEventListener("click", function (e) {
    var trigger = $(this);
    $(".popup #popup_contents").html(element.popupContent);
    var popup = $(".popup");
    let triggerPosition = trigger.offset();
    var popupHeight = $(".popup").outerHeight();

    var spaceAbove = triggerPosition.top;
    var spaceBelow =
      $(window).height() - (triggerPosition.top + trigger.outerHeight());
    if (spaceBelow >= popupHeight) {
      // If there is enough space below, position the popup below the trigger
      popup.css({
        top: triggerPosition.top + trigger.outerHeight(),
        left: triggerPosition.left - 200,
      });
    } else if (spaceAbove >= popupHeight) {
      // If there is enough space above, position the popup above the trigger
      popup.css({
        top: triggerPosition.top - popupHeight,
        left: triggerPosition.left - 200,
      });
    } else {
      // If there is not enough space both above and below, position it at the top of the viewport
      popup.css({
        top: 0,
        left: triggerPosition.left - 200,
      });
    }

    $(".popup").show();
  });
};

function displayResults(teamName, results) {
  const entries = [...results]; // or const entries = Array.from(map);
  entries.sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

  const sortedMap = new Map(entries);
  const listNode = document.getElementById("list_players");
  document.getElementById("team_name").innerHTML =
    teamName.charAt(0).toUpperCase() + teamName.substring(1) + " Roster";
  const fragment = document.createDocumentFragment();
  for (const [key, player] of sortedMap.entries()) {
    let imgUrl =
      player.get("headshot_url")?.replace('"', "") +
      "," +
      player.get("ngs_position")?.replace('"', "");

    let img = `<img src = "${imgUrl}" width="50" height="50">`;
    const name =
      img + " " + player.get("jersey_number") + ": " + player.get("full_name");
    const li = document.createElement("li");
    li.classList.add("panel-result");
    li.classList.add("hover-trigger");
    li.innerHTML = name;
    li.popupContent = buildPopupContent(player);
    setupHovers(li);
    fragment.appendChild(li);
  }

  listNode.innerHTML = "";
  listNode.appendChild(fragment);
}

const setUpFilters = (sport, headers, line) => {
  const values = line.split(","); // Buggy, should ignore commas in ""

  values.forEach((value, j) => {
    let header = headers[j];
    if (nflFilterableFields.indexOf(header) > -1) {
      let set = nflFilters.get(header);

      if (!set) {
        set = new Set();
        nflFilters.set(header, set);
      }
      set.add(value.trim());
    }
  });
  // for (const j = 0; j < values.length; j++) {

  // }
};

const loadPlayerData = (headers, values) => {
  const playerMap = new Map();
  let i = 0;
  headers.forEach((key) => {
    playerMap.set(key, values[i]);
    if (key === "position") {
      data = nflPositions.get(values[i]);
      if (data) {
        var info = data.split(",");
        playerMap.set("position", info[0].trim());
        var subteam = info[1].trim();
        playerMap.set(
          "subteam",
          subteam === "O"
            ? "Offense"
            : subteam === "D"
            ? "Defense"
            : "Special Teams"
        );
      } else {
        console.log("No data for " + values[i]);
      }
    }
    i++;
  });

  return playerMap;
};

const loadNBARosters = () => {
  console.log("Loading NBA Roster");

  fetch("../data/nbaRoster.json")
    .then((response) => response.json())
    .then((data) => {
      // Access and use the JSON data here
      console.log(data);
    })
    .catch((error) => {
      // Handle errors
      console.error(error);
    });
};

const populateFilters = (sports) => {
  const filters = document.getElementById("filter-types");
  const fragment = document.createDocumentFragment();

  const li = document.createElement("option");
  li.value = "";
  li.innerHTML = "Select to Add a Filter";
  fragment.appendChild(li);
  nflFilters.forEach((value, key) => {
    const li = document.createElement("option");
    li.value = key;
    li.innerHTML = key;
    fragment.appendChild(li);
    addFilterableList(key);
  });

  filters.innerHTML = "";
  filters.appendChild(fragment);
};

const addFilterableList = (key) => {
  values = nflFilters.get(key);
  const fragment = document.createDocumentFragment();
  const select = document.createElement("select");
  select.classList.add("sports-filter");
  select.id = "filter-" + key;
  const li = document.createElement("option");
  li.value = "";
  li.innerHTML = "Select a " + key;
  select.appendChild(li);
  const entries = [...values].sort(); // or const entries = Array.from(map);

  entries.forEach((val) => {
    if (val.trim().length > 0) {
      const li = document.createElement("option");
      li.value = val;
      li.innerHTML = val;
      select.appendChild(li);
    }
  });
  fragment.appendChild(select);
  const filters = document.getElementById("show-filters");

  filters.appendChild(fragment);
};
