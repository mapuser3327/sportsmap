import * as mapping from "./map.js";
import * as utils from "./utils.js";
var currentMarkerGroup;
var searchControl;
const rosterMaps = {};
export const sports = ["nfl", "nba", "mlb", "nhl", "mls"];

const allTeamsMap = new Map();
export const nflPositions = new Map();
//Team_Code,Team_Name,Player_Name,Player_No,Position,Age,Height,Weight,Years_Experience,College
export const nflFilterableFields = [
  "Position",
  "Age",
  "Years_Experience",
  "Player_name",
  "College",
];
export const nbaFilterableFields = [
  "SEASON",
  "POSITION",
  "LAST_NAME",
  "SCHOOL",
];

export const nflFilters = new Map();
export const nbaFilters = new Map();

export const init = () => {
  const maps = utils.loadTeams(sports);
  console.log(maps);
  sports.forEach((sport) => {
    allTeamsMap.set(sport, maps.get(sport));
  });
  loadNFLPositions();
  sports.forEach((sport) => {
    loadRoster(sport);
  });

  displayMenu(sports);
};

export const teamLogos = [
  "https://static.www.nfl.com/image/upload/v1554321393/league/nvfr7ogywskqrfaiu38m.svg",
  "https://cdn.nba.com/logos/leagues/logo-nba.svg",
  "https://www.mlbstatic.com/team-logos/league-on-dark/1.svg",
  "https://media.d3.nhle.com/image/private/t_q-best/prd/assets/nhl/logos/nhl_shield_wm_on_dark_fqkbph",
  "https://images.mlssoccer.com/image/upload/v1665849438/assets/logos/MLS-Crest-FFF-480px_tmwlkh.png",
];

// define functions that right icon for a given feature
export const getIconUrl = (sport, index, name) => {
  let lname = utils.formatVal(name);
  //console.log(lname);
  const map = allTeamsMap.get(sport);
  //console.log(sport, allTeamsMap, map);
  let teamid = 1;
  if (!map) console.log("no map for index = " + index);
  else {
    //console.log(map);
    let data = map.get(lname);
    if (data != null) {
      teamid = data.get("team_code");
    } else console.log(lname);
  }
  let teamUrl = utils.getTeamUrl(index, teamid);
  var icon = L.icon({
    iconUrl: teamUrl,
    iconSize: [35, 35],
  });

  return icon;
};

const loadNFLPositions = () => {
  //console.log("Loading NFL Positions");

  fetch("../data/NFLPositions.csv")
    .then(function (response) {
      return response.text();
    })
    .then(function (text) {
      const lines = text.split("\n");
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

const initSportsData = () => {
  //
};

const loadRoster = (sport) => {
  console.log(`Loading ${sport} Roster`);

  fetch(`../data/${sport}rosters.csv`)
    .then(function (response) {
      return response.text();
    })
    .then(function (text) {
      //Team_Code,Team_Name,Player_Name,Player_No,Position,Age,Height,Weight,College,Salary
      const lines = text.split("\n");
      const headers = lines[0].split(",");

      let teamMap = new Map();
      for (var i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() != "") {
          const values = line.split(","); // Buggy, should ignore commas in ""
          const player = utils.getDataMap(headers, values);
          if (player.get("Player_Name") != null) {
            const teamKey = utils.formatVal(player.get("Team_Name")); // 3 digit code for NFL team'
            let teamData = teamMap.get(teamKey);
            if (!teamData) {
              teamData = new Map();
            }

            const unique_id = utils.formatVal(
              player.get("Player_Name"),
              player.get("espn_id")
            );
            setUpFilters(sport, player);
            teamData.set(unique_id, player);
            teamMap.set(teamKey, teamData);
          } else {
            //console.log(sport, player);
          }
        }
      }

      rosterMaps[sport] = teamMap;
      console.log(rosterMaps);
    })
    .catch(function (err) {
      // Error handling goes here (e.g. the network request failed, etc)
      console.log(err);
    });
};

export const displayMenu = (sports) => {
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

    a.addEventListener("click", () => changeLayer(sport));

    a.innerHTML = `<img id="${sport}" width="40px" height="40px" src="${teamLogos[index]}">`;
    li.appendChild(a);
    fragment.appendChild(li);
  });
  listNode.innerHTML = "";
  listNode.appendChild(fragment);
};

export const showRoster = (sport, teamName) => {
  //console.log(teamName);
  let lname = utils.formatVal(teamName);
  const sportsMap = allTeamsMap.get(sport);
  const teamData = sportsMap.get(teamName);
  //console.log(teamData, rosterMaps);
  const teamMaps = rosterMaps[sport];
  // console.log(teamMaps);
  const roster = teamMaps.get(teamName);
  // console.log(teamData, roster);
  displayResults(sport, teamData, roster);
  $(".panel-side").show();
};

export const buildPopupContent = (sport, teamData, player) => {
  let wikiPlayerName = "";
  let urlPlayerName = "";
  let imgUrl = "";
  let playerNo = "";
  let fullName = "";
  let position = "";
  let age = "";
  let height = "";
  let weight = "";
  let college = "";
  let yearsExp = "";
  let salary = "";
  let teamName = "";
  let rookieYear = "";
  let draftData = "";
  let espnUrl = "";
  let teamId = teamData.get("team_code");
  let hometown =
    player.get("HomeTown") == null
      ? ""
      : player.get("HomeTown").replace("_", ",").replace("CAN", "Canada");
  if (hometown != null) {
    hometown = hometown.trim();
    let splits = hometown.split(",");
    if (splits.length > 1 && splits[1].trim().length == 2) {
      hometown += ", United States";
    }
  }

  const index = sports.indexOf(sport);
  let teamUrl = utils.getTeamUrl(index, teamId);
  const teamLink = teamData.get("team_url");
  const teamHref = `<a href="${teamLink}" target="_blank">
    <img src="${teamUrl}" alt="${teamData.get(
    "team_name"
  )} width="50px" height="50px">
    </a>`;
  //Team_Code,Team_Name,Player_Name,Player_No,Position,Age,Height,Weight,Years_Experience,College
  teamName = player.get("Team_Name");
  fullName = player.get("Player_Name");
  playerNo = player.get("Player_No");
  wikiPlayerName = fullName.replace(" ", "_");
  position = player.get("Position") == null ? "" : player.get("Position");
  age = player.get("Age");
  height = player.get("Height");
  weight = player.get("Weight");
  college = player.get("College");
  espnUrl = player.get("espn_url");

  imgUrl =
    player
      .get("espn_headshot")
      .replace("/i/headshots/", "/combiner/i?img=/i/headshots/") +
    "&h=230&w=280&scale=crop";
  if (sport === "nfl") {
    urlPlayerName = "players/" + fullName.replace(" ", "-").toLowerCase();

    yearsExp = player.get("Years_Experience");
  } else if (sport === "nba") {
    //Team_Code,Team_Name,Player_Name,Player_No,Position,Age,Height,Weight,College,Salary

    urlPlayerName =
      "player/" +
      player.get("Player_No") +
      "/" +
      fullName.replace(" ", "-").toLowerCase();

    salary = player.get("Salary").replaceAll("_", ",");
  }

  const content =
    `<h2 class="centered">#${playerNo} - ${fullName}<h2>
      <h4 class="centered">${teamHref}&nbsp;&nbsp; ${teamName} ${position} </h4>` +
    (hometown == "" ? `` : `<h6 class="centered">From: ${hometown}</h6>`) +
    `<hr>
    <a target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/${wikiPlayerName}">Wikipedia</a>
    &nbsp;&nbsp;&nbsp;<a target="_blank" rel="noopener noreferrer" href="https://www.${sport}.com/${urlPlayerName}">${sport.toUpperCase()} Stats</a>
    &nbsp;&nbsp;&nbsp;<a target="_blank" rel="noopener noreferrer" href=${espnUrl}">ESPN Player Data</a>
    </td><tr>
  <table style="border:0px"><tr>
    <td>
    <img src = "${imgUrl}">
    </td>
    </tr> 
    <tr><td><table class="popup_demo">   
    <tr><th>Age</th><th>Height</th><th>Weight</th><th>Years Played</th><th>Salary</th></tr>
    <td> ${age}</td><td> ${height}</td><td> ${weight}</td><td>${yearsExp}</td><td>${salary}</td>
    </tr>
    </table></td></tr> 
    <tr><td><table class="popup_demo">   
    <tr><th>College</th><th>Rookie Year</th><th>Drafted By</th></tr>
    <td>${college}</td><td> ${rookieYear}</td><td> ${draftData}</td><tr>
    
    </table></td></tr>
   <tr><td>
 
  </table>
  `;
  return content;
};

export const setupHovers = (element) => {
  element.addEventListener("click", function (e) {
    $(".popup").hide();
    var trigger = $(this);
    $(".popup #popup_contents").html(element.popupContent);
    var popup = $(".popup");
    let triggerPosition = trigger.offset();
    var popupHeight = $(".popup").outerHeight() + 100;

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
        top: triggerPosition.top - popupHeight / 2,
        left: triggerPosition.left - 200,
      });
    }

    $(".popup").show();
  });
};

export const displayResults = (sport, teamData, roster) => {
  const entries = [...roster]; // or const entries = Array.from(map);
  // entries.sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
  // Team_Code,Team_Name,Player_Name,Player_No,Position,Age,Height,Weight,Years_Experience,College

  const sortedMap = new Map(entries);
  const index = sports.indexOf(sport);
  const teamURL = utils.getTeamUrl(index, teamData.get("team_code"));
  const teamLink = teamData.get("team_url");
  const teamHref = `<a href="${teamLink}" target="_blank">
    <img src="${teamURL}" alt="${teamData.get(
    "team_name"
  )} width="50px" height="50px">
    </a>`;
  const listNode = document.getElementById("list_players");
  document.getElementById("team_name").innerHTML =
    teamHref + " &nbsp;&nbsp;" + teamData.get("team_name") + " Roster";
  const fragment = document.createDocumentFragment();
  for (const [key, player] of sortedMap.entries()) {
    let playerNo = player.get("Player_No");
    let fullName = player.get("Player_Name");
    let imgUrl =
      player
        .get("espn_headshot")
        .replace("/i/headshots/", "/combiner/i?img=/i/headshots/") +
      "&h=50&w=55&scale=crop";

    let img = `<img src = "${imgUrl}">`;
    const name = img + " " + playerNo + ": " + fullName;
    const li = document.createElement("li");
    li.classList.add("panel-result");
    li.classList.add("hover-trigger");
    setFields(sport, li, player);
    li.innerHTML = name;
    li.popupContent = buildPopupContent(sport, teamData, player);
    setupHovers(li);
    fragment.appendChild(li);
  }

  listNode.innerHTML = "";
  listNode.appendChild(fragment);
};

export const setUpFilters = (sport, player) => {
  if (sport === "nfl") {
    nflFilterableFields.forEach((field) => {
      let set = nflFilters.get(field);

      if (!set) {
        set = new Set();
        nflFilters.set(field, set);
      }

      let value = player.get(field);
      if (value && value.trim() !== "") set.add(value);
    });
  } else if (sport === "nba") {
    nbaFilterableFields.forEach((field) => {
      let set = nbaFilters.get(field);

      if (!set) {
        set = new Set();
        nbaFilters.set(field, set);
      }

      let value = player.get(field);
      if (value && value.trim() !== "") set.add(value);
    });
  }
};

export const setFields = (sport, li, player) => {
  const sportFields =
    sport === "nfl" ? nflFilterableFields : nbaFilterableFields;
  sportFields.forEach((field) => {
    let value = player.get(field);
    li.setAttribute(field, value);
  });
};

export const loadPlayerData = (headers, values) => {
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
        // console.log("No data for " + values[i]);
      }
    }
    i++;
  });

  return playerMap;
};

export const populateFilters = (sport) => {
  const filters = document.getElementById("filter-types");
  const fragment = document.createDocumentFragment();

  const li = document.createElement("option");
  li.value = "";
  li.innerHTML = "Select to Add a Filter";
  fragment.appendChild(li);
  const sportFilters = sport === "nfl" ? nflFilters : nbaFilters;
  sportFilters.forEach((value, key) => {
    const li = document.createElement("option");
    li.value = key;
    li.innerHTML = key;
    fragment.appendChild(li);
    addFilterableList(sport, key);
  });

  filters.innerHTML = "";
  filters.appendChild(fragment);
};

export const filterBy = (val) => {
  console.log(val);
};

export const addFilterableList = (sport, key) => {
  const sportsFilters = sport === "nfl" ? nflFilters : nbaFilters;
  const values = sportsFilters.get(key);
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

export const changeLayer = (sport) => {
  $(".panel-side").hide();
  $(".popup").hide();
  populateFilters(sport);
  $("#mappedEvent").val("");
  if (currentMarkerGroup) {
    currentMarkerGroup.clearLayers();
  }
  $("a.nav-link.active").removeClass("active");
  $(`#nav-link-${sport}`).addClass("active");
  let index = -1;
  mapping.sportsLayerMap.forEach((lyr, k) => {
    index++;
    if (k.toLowerCase().indexOf(sport) > -1) {
      mapping.map.addLayer(lyr);
      //console.log($("#panel-side"));
      searchControl?.remove(mapping.map);
      searchControl = L.control
        .search({
          layer: lyr,
          container: $("#panel-side")[0],
          initial: false,
          propertyName: "team",
          hideMarkerOnCollapse: true,
          //zoom: 7,
          marker: {
            icon: null,
            circle: {
              radius: 20,
              color: "#0a0",
              opacity: 1,
            },
          },
        })
        .addTo(mapping.map);
      $(".leaflet-control-search .search-button").css(
        "background",
        `url('${teamLogos[index]}') center/90% no-repeat ${
          sport === "mls" ? "#000" : "#fff"
        }`
      );

      console.log(
        $(".leaflet-control-search .search-button").css("background")
      );
    } else mapping.map.removeLayer(lyr);
  });
};
