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

  var overlayMaps = {};

  const layerControl = L.control
    .layers(baseMaps, overlayMaps, { collapsed: false })
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
  function metrosOnEachFeature(feature, layer) {
    layer.on({
      click: function (e) {
        // reset symbol of old selection
        if (selection) {
          if (selectedLayer === metroLayer)
            selection.setIcon(iconByPassday(selectedFeature));
        }

        // apply yellow icon to newly selected metro and update selection variables
        e.target.setIcon(metroSelected);
        selection = e.target;
        selectedLayer = metroLayer;
        selectedFeature = feature;

        // using attributes, construct some HTML to write into the page
        var featureName = feature.properties.CITY || 'Unnamed feature';
        var country = feature.properties.COUNTRY || '(Unknown)';
        var year = feature.properties.YEAR || '(Unknown)';
        var passengers = feature.properties.PASSDAY || '(Unknown)';
        var stations = feature.properties.STATIONS || '(Unknown)';
        var length = feature.properties.LENGTHKM || '(Unknown)';
        var link = feature.properties.LINK || 'http://www.wikipedia.org';
        var photoHtml =
          feature.properties.PHOTO || '<P>Photo not available</P>';
        var titleHtml =
          '<p style="font-size:18px"><b>' + featureName + '</b></p>';
        var descripHtml =
          '<p>The ' +
          featureName +
          ', ' +
          country +
          ' metro opened in ' +
          year +
          ' and currently serves ' +
          passengers +
          ' passengers a day. The network consists of ' +
          stations +
          ' stations spread over ' +
          length +
          ' kilometers.</p>';
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
}
