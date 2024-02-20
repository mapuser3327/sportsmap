var map;
var searchControl;
var currentMarkerGroup;

function changeLayer(sport) {
  populateFilters(sport);
  $("#mappedEvent").val("");
  if (currentMarkerGroup) {
    currentMarkerGroup.clearLayers();
  }
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
  // initSportsData();
  initSportsData2();
  loadNFLPositions();
  loadNFLRosters();
  loadNBARosters();
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

  overlayMaps = new Map();

  // define functions that right icon for a given feature
  const getIconUrl = (sport, index, name) => {
    let lname = name.toLowerCase();
    const map = teamMaps[index];
    let teamid = 1;
    if (!map) console.log("no map for index = " + index);
    else {
      // console.log(map);
      teamid = map.get(lname);
      if (!teamid) console.log(lname);
    }
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
  };

  $.getJSON("../data/venues.geojson", function (data) {
    sports.forEach((sport, index) => {
      venueLayer = L.geoJson(data, {
        id: sport,
        filter: function (feature) {
          return feature.properties.sport === sport.toUpperCase();
        },
        pointToLayer: function (feature, latlng) {
          const teamName = feature.properties.team
            .toLowerCase()
            .replace(/ /g, "-");

          const marker = L.marker(latlng, {
            icon: getIconUrl(sport, index, teamName),
          });

          marker.addEventListener("click", () => showRoster(sport, teamName));
          return marker;
        },
        // onEachFeature: function (feature, layer) {
        //   layer
        //     .bindPopup
        //     // feature.properties.team + "<br/>Stay Tuned For Stats"
        //     ();
        // },
      });
      if (venueLayer) {
        sportsLayerMap.set(sport.toUpperCase() + " Venues", venueLayer);
        overlayMaps.set(`${sport.toUpperCase()} Venues`, venueLayer);
      }

      let teamLocations = new Map();

      venueLayer.eachLayer(function (layer) {
        // console.log(layer);
        // console.log(layer.feature.properties.team);
        // console.log(layer.getLatLng());

        const parts = layer.feature.properties.team.toLowerCase().split(" ");
        let teamName = parts[parts.length - 1];

        if (sport === "mls") {
          teamName = layer.feature.properties.team
            .toLowerCase()
            .replace(/ /g, "-");
        }
        let teamId = (teamid = teamMaps[index]?.get(teamName));

        teamLocations.set(teamId, layer.getLatLng());
      });

      allTeamLocations.set(sport, teamLocations);
    });
  });

  // const playerLayer = L.geoJSON(eaglesPlayers, {
  //   onEachFeature: function (feature, layer) {
  //     // console.log(feature.properties);
  //     const html = `<li>${feature.properties.Name} ${feature.properties.EventType}<li>Year: ${feature.properties.EventYear}<li>Position: ${feature.properties.Position}<li>Team: ${feature.properties.Team}<li><a target="_blank" rel="noopener noreferrer" href="https://www.google.com/search?q=nfl+${feature.properties.Team}">Team Data</a>`;
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
        var readmoreHtml =
          '<p><a target="_blank" rel="noopener noreferrer" href="' +
          link +
          '">Read more</a></p>';
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

const showHidePlayers = (key, value) => {
  //let matches = $("#list_players li[" + key + "]");
  $("#list_players li")
    .filter(function () {
      return $(this).attr(key) !== value;
    })
    .hide();
  $("#list_players li")
    .filter(function () {
      return $(this).attr(key) === value;
    })
    .show();
};

const showDropDown = (value) => {
  $(".sports-filter").hide();
  $("#filter-" + value).show();
  $("#filter-" + value).on("change", function () {
    const selectedValue = $(this).val();
    showHidePlayers(value, selectedValue);
  });
};
