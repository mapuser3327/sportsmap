const sportsLayerMap = new Map();
const teamLogos = [
  "https://static.www.nfl.com/image/upload/v1554321393/league/nvfr7ogywskqrfaiu38m.svg",
  "https://cdn.nba.com/logos/leagues/logo-nba.svg",
  "https://www.mlbstatic.com/team-logos/league-on-dark/1.svg",
  "https://media.d3.nhle.com/image/private/t_q-best/prd/assets/nhl/logos/nhl_shield_wm_on_dark_fqkbph",
  "https://images.mlssoccer.com/image/upload/v1665849438/assets/logos/MLS-Crest-FFF-480px_tmwlkh.png",
];

var map;
var searchControl;
function changeLayer(sport) {
  $("a.nav-link.active").removeClass("active");
  $(`#nav-link-${sport}`).addClass("active");
  let index = -1;
  sportsLayerMap.forEach((lyr, k) => {
    index++;
    if (k.toLowerCase().indexOf(sport) > -1) {
      map.addLayer(lyr);
      console.log($("#panel-side"));
      searchControl?.remove(map);
      searchControl = L.control
        .search({
          layer: lyr,
          container: $("#panel-side")[0],
          initial: false,
          propertyName: "team",
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
        .addTo(map);
      $(".leaflet-control-search .search-button").css(
        "background",
        `url('${teamLogos[index]}') center/90% no-repeat ${
          sport === "mls" ? "#000" : "#fff"
        }`
      );

      console.log(
        $(".leaflet-control-search .search-button").css("background")
      );
    } else map.removeLayer(lyr);
  });
}

function init() {
  const sports = ["nfl", "nba", "mlb", "nhl", "mls"];
  displayMenu(sports);

  // create map and set center and zoom level

  map = new L.map("mapid");
  let selection;
  let selectedLayer;
  let selectedFeature;

  map.setView([40, -95], 4);

  const worldLayer = L.tileLayer(
    "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 19,
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      opacity: 1,
    }
  );

  // create and add osm tile layer
  const osm = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }
  );

  // create osm humanitarian layer (not adding it to map)
  const osmHumanitarian = L.tileLayer(
    "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }
  );

  const Thunderforest_TransportDark = L.tileLayer(
    "https://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 22,
    }
  );

  //var esriBasemap = L.esri.Vector.vectorBasemapLayer('streets-vector', {});

  // define basemap and thematic layers and add layer switcher control
  const baseMaps = {
    OSM: osm,
    "OSM Humanitarian": osmHumanitarian,
    "World Imagery": worldLayer,
    "Thunderforest Dark": Thunderforest_TransportDark,
    //esriBasemap: esriBasemap,
  };
  map.addLayer(osmHumanitarian);
  // add the metro GeoJSON layer

  teamMaps = [];
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
  console.log(nbaTeamData);
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

  let searchLayer;
  overlayMaps = new Map();
  $.getJSON("./venues.geojson", function (data) {
    sports.forEach((sport, index) => {
      venueLayer = L.geoJson(data, {
        id: sport,
        filter: function (feature) {
          return feature.properties.sport === sport.toUpperCase();
        },
        pointToLayer: function (feature, latlng) {
          const parts = feature.properties.team.toLowerCase().split(" ");
          let teamName = parts[parts.length - 1];

          if (sport === "mls") {
            teamName = feature.properties.team.toLowerCase().replace(/ /g, "-");
          }
          const marker = L.marker(latlng, {
            icon: getIconUrl(sport, index, teamName),
          });
          //?.on("click", showRoster("eagles"));
          marker.addEventListener("click", () => showRoster(sport, teamName));
          return marker;
        },
        onEachFeature: function (feature, layer) {
          layer.bindPopup(
            feature.properties.team + "<br/>Stay Tuned For Stats"
          );
        },
      });
      if (venueLayer) {
        sportsLayerMap.set(sport.toUpperCase() + " Venues", venueLayer);
        overlayMaps.set(`${sport.toUpperCase()} Venues`, venueLayer);
      }
    });
  });

  // const playerLayer = L.geoJSON(eaglesPlayers, {
  //   onEachFeature: function (feature, layer) {
  //     // console.log(feature.properties);
  //     const html = `<li>${feature.properties.Name} ${feature.properties.EventType}<li>Year: ${feature.properties.EventYear}<li>Position: ${feature.properties.Position}<li>Team: ${feature.properties.Team}<li><a href="https://www.google.com/search?q=nfl+${feature.properties.Team}">Team Data</a>`;
  //     layer.bindPopup(html);
  //   },
  //   pointToLayer: function (feature, latlng) {
  //     const nameparts = feature.properties.Name.toLowerCase().split(" ");
  //     const lname = nameparts[1] + "_" + nameparts[0];
  //     return L.marker(latlng, {
  //       icon: getIcon("eaglesProfilePics", lname),
  //     });
  //   },
  // }).addTo(map);

  // overlayMaps = {
  //   // 'NFL Stadiums': stadiumLayer,
  //   // 'NBA Arenas': arenaLayer,
  //   // Players: playerLayer,
  // };

  // define functions that right icon for a given feature
  function getIcon(folder, name) {
    let lname = name.toLowerCase();
    var icon = L.icon({
      iconUrl: folder + "/" + lname + ".webp",
      iconSize: [35, 35],
    });

    return icon;
  }
  // define functions that right icon for a given feature
  function getIconUrl(sport, index, name) {
    let lname = name.toLowerCase();
    teamid = teamMaps[index]?.get(lname);

    urls = [
      `https://static.www.nfl.com/t_q-best/league/api/clubs/logos/${teamid}`,
      `https://cdn.nba.com/logos/nba/${teamid}/primary/L/logo.svg`,
      `https://www.mlbstatic.com/team-logos/${teamid}.svg`,
      `https://assets.nhle.com/logos/nhl/svg/${teamid}_light.svg`,
      `https://images.mlssoccer.com/image/upload/t_q-best${teamid}`,
    ];

    var icon = L.icon({
      iconUrl: urls[index],
      iconSize: [35, 35],
    });

    return icon;
  }
  // define function to handle click events on metro features
  function playersOnEachFeature(feature, layer) {
    layer.on({
      click: function (e) {
        // reset symbol of old selection
        // if (selection) {
        //   if (selectedLayer === metroLayer)
        //     selection.setIcon(iconByPassday(selectedFeature));
        // }

        // apply yellow icon to newly selected metro and update selection variables
        // e.target.setIcon(metroSelected);
        // selection = e.target;
        // selectedLayer = metroLayer;
        // selectedFeature = feature;

        // using attributes, construct some HTML to write into the page
        var featureName = feature.properties.Name || "Unnamed feature";
        var team = feature.properties.Team || "(Unknown)";
        var year = feature.properties.YEAR || "(Unknown)";
        // var passengers = feature.properties.PASSDAY || '(Unknown)';
        // var stations = feature.properties.STATIONS || '(Unknown)';
        // var length = feature.properties.LENGTHKM || '(Unknown)';
        var link = feature.properties.LINK || "http://www.wikipedia.org";
        var photoHtml =
          feature.properties.PHOTO || "<P>Photo not available</P>";
        var titleHtml =
          '<p style="font-size:18px"><b>' + featureName + "</b></p>";
        var descripHtml = "<p>The " + featureName + ", " + team + " </p>";
        var readmoreHtml = '<p><a href="' + link + '">Read more</a></p>';
        document.getElementById("summaryLabel").innerHTML =
          titleHtml + descripHtml + readmoreHtml;
        document.getElementById("metroImage").innerHTML = photoHtml;

        L.DomEvent.stopPropagation(e); // stop click event from being propagated further
      },
    });
    changeLayer("nfl");

    // const layerControl = L.control
    //   .layers(baseMaps, overlayMaps, {
    //     position: "bottomLeft",
    //     collapsed: true,
    //   })
    //   .addTo(map);
  }

  // define and register event handler for click events to unselect features when clicked anywhere else on the map
  map.addEventListener("click", function (e) {
    if (selection) {
      if (selectedLayer === metroLayer)
        selection.setIcon(iconByPassday(selectedFeature));

      selection = null;

      document.getElementById("summaryLabel").innerHTML =
        "<p>Click a metro rail system on the map to get more information.</p>";
      document.getElementById("metroImage").innerHTML = "";
    }
  });
}

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

function showRoster(sport, teamName) {
  displayResults(eagles);
}

function displayResults(results) {
  const listNode = document.getElementById("list_players");
  const fragment = document.createDocumentFragment();
  results.features.forEach(function (player, index) {
    // county.popupTemplate = popupInfo;

    const attributes = player.properties;

    const nameparts = attributes.player.toLowerCase().split(" ");
    const lname = nameparts[1] + "_" + nameparts[0];
    const img = `<img src="./eaglesProfilePics/${lname}.webp" width="50" height="35">`;
    const name = img + "  " + attributes.player_no + ": " + attributes.player;

    const li = document.createElement("li");
    li.classList.add("panel-result");
    li.tabIndex = 0;
    li.setAttribute("data-result-id", index);
    li.setAttribute("unit", attributes.unit);
    li.setAttribute("position", attributes.position);
    li.innerHTML = name;
    fragment.appendChild(li);
  });

  listNode.innerHTML = "";
  listNode.appendChild(fragment);
}
