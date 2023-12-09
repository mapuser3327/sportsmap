var map;
var sportsLayerMap = new Map();

function init() {
  // create map and set center and zoom level
  map = new L.map('mapid');
  let selection;
  let selectedLayer;
  let selectedFeature;

  map.setView([40, -95], 4);

  const worldLayer = L.tileLayer(
    'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      maxZoom: 19,
      attribution:
        'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      opacity: 1,
    }
  );

  // create and add osm tile layer
  const osm = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }
  );

  // create osm humanitarian layer (not adding it to map)
  const osmHumanitarian = L.tileLayer(
    'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }
  );

  const Thunderforest_TransportDark = L.tileLayer(
    'https://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png',
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
    'OSM Humanitarian': osmHumanitarian,
    'World Imagery': worldLayer,
    'Thunderforest Dark': Thunderforest_TransportDark,
    //esriBasemap: esriBasemap,
  };
  map.addLayer(osmHumanitarian);
  // add the metro GeoJSON layer

  const arenaLayer = L.geoJson(arenas, {
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, {
        icon: getIcon('nbaIcons', feature.properties.team),
      });
    },
    // onEachFeature: metrosOnEachFeature,
  });
  sportsLayerMap.set('arenas', arenaLayer);

  const stadiumLayer = L.geoJson(stadiums, {
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, {
        icon: getIcon('nflIcons', feature.properties.team_short_name),
      });
    },
    // onEachFeature: metrosOnEachFeature,
  });
  stadiumLayer.addTo(map);
  sportsLayerMap.set('stadiums', stadiumLayer);

  // $.getJSON('./stadiums.geojson', function (data) {
  //   stadiumLayer = L.geoJson(data, {
  //     pointToLayer: function (feature, latlng) {
  //       console.log(feature);
  //       return L.marker(latlng, {
  //         icon: getIcon('nfl', feature.properties.team_short_name),
  //       });
  //     },
  //     onEachFeature: function (feature, layer) {
  //       layer.bindPopup(feature.properties.id);
  //     },
  //     // style: function (feature) {
  //     //         if (feature.properties["Water Testing Report"] == 'BLACK') {return {fillColor: '#1D1061'}};
  //     //         if (feature.properties["Water available at visit"] == "No") {return {fillColor: '#dd0022'}}
  //     //     }
  //   });
  //   map.addLayer(stadiumLayer);
  //   layerControl.addOverlay(stadiumLayer, 'Stadiums');
  // });

  const playerLayer = L.geoJSON(eaglesPlayers, {
    onEachFeature: function (feature, layer) {
      console.log(feature.properties);
      const html = `<li>${feature.properties.Name} ${feature.properties.EventType}<li>Year: ${feature.properties.EventYear}<li>Position: ${feature.properties.Position}<li>Team: ${feature.properties.Team}<li><a href="https://www.google.com/search?q=nfl+${feature.properties.Team}">Team Data</a>`;
      layer.bindPopup(html);
    },
    pointToLayer: function (feature, latlng) {
      const nameparts = feature.properties.Name.toLowerCase().split(' ');
      const lname = nameparts[1] + '_' + nameparts[0];
      return L.marker(latlng, {
        icon: getIcon('eaglesProfilePics', lname),
      });
    },
  }).addTo(map);

  var overlayMaps = {
    'NFL Stadiums': stadiumLayer,
    'NBA Arenas': arenaLayer,
    Players: playerLayer,
  };

  const layerControl = L.control
    .layers(baseMaps, overlayMaps, { position: 'bottomleft', collapsed: true })
    .addTo(map);

  // define functions that right icon for a given feature
  function getIcon(folder, name) {
    let lname = name.toLowerCase();
    var icon = L.icon({
      iconUrl: folder + '/' + lname + '.webp',
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
        var featureName = feature.properties.Name || 'Unnamed feature';
        var team = feature.properties.Team || '(Unknown)';
        var year = feature.properties.YEAR || '(Unknown)';
        // var passengers = feature.properties.PASSDAY || '(Unknown)';
        // var stations = feature.properties.STATIONS || '(Unknown)';
        // var length = feature.properties.LENGTHKM || '(Unknown)';
        var link = feature.properties.LINK || 'http://www.wikipedia.org';
        var photoHtml =
          feature.properties.PHOTO || '<P>Photo not available</P>';
        var titleHtml =
          '<p style="font-size:18px"><b>' + featureName + '</b></p>';
        var descripHtml = '<p>The ' + featureName + ', ' + team + ' </p>';
        var readmoreHtml = '<p><a href="' + link + '">Read more</a></p>';
        document.getElementById('summaryLabel').innerHTML =
          titleHtml + descripHtml + readmoreHtml;
        document.getElementById('metroImage').innerHTML = photoHtml;

        L.DomEvent.stopPropagation(e); // stop click event from being propagated further
      },
    });
  }

  // define and register event handler for click events to unselect features when clicked anywhere else on the map
  map.addEventListener('click', function (e) {
    if (selection) {
      if (selectedLayer === metroLayer)
        selection.setIcon(iconByPassday(selectedFeature));

      selection = null;

      document.getElementById('summaryLabel').innerHTML =
        '<p>Click a metro rail system on the map to get more information.</p>';
      document.getElementById('metroImage').innerHTML = '';
    }
  });

  document
    .getElementById('stadiums')
    .addEventListener('click', (e) => addLayer(e));
  document
    .getElementById('arenas')
    .addEventListener('click', (e) => addLayer(e));

  const addLayer = (e) => {
    $('a.nav-link.active').removeClass('active');

    $(e.target.parentElement).addClass('active');
    sportsLayerMap.forEach((lyr, k) => {
      if (k === e.target.id) {
        map.addLayer(lyr);
      } else map.removeLayer(lyr);
    });
  };

  displayResults(eagles);

  function displayResults(results) {
    const listNode = document.getElementById('list_players');
    const fragment = document.createDocumentFragment();
    results.features.forEach(function (player, index) {
      // county.popupTemplate = popupInfo;

      const attributes = player.properties;
      if (!attributes.player_name) console.log(player);
      const nameparts = attributes.player.toLowerCase().split(' ');
      const lname = nameparts[1] + '_' + nameparts[0];
      const img = `<img src="./eaglesProfilePics/${lname}.webp" width="50" height="35">`;
      const name = img + '  ' + attributes.player_no + ': ' + attributes.player;

      const li = document.createElement('li');
      li.classList.add('panel-result');
      li.tabIndex = 0;
      li.setAttribute('data-result-id', index);
      li.setAttribute('unit', attributes.unit);
      li.setAttribute('position', attributes.position);
      li.innerHTML = name;
      fragment.appendChild(li);
    });

    listNode.innerHTML = '';
    listNode.appendChild(fragment);
  }
}
