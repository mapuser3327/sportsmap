import * as initialize from "./initData.js";

export const sportsLayerMap = new Map();
export const allTeamLocations = new Map();

export const map = new L.map("mapid");

export const initializeMap = () => {
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

  const overlayMaps = new Map();

  $.getJSON("../data/venues.geojson", function (data) {
    initialize.sports.forEach((sport, index) => {
      const venueLayer = L.geoJson(data, {
        id: sport,
        filter: function (feature) {
          return feature.properties.sport === sport.toUpperCase();
        },
        pointToLayer: function (feature, latlng) {
          const teamName = feature.properties.team
            .toLowerCase()
            .replace(/ /g, "-");

          const marker = L.marker(latlng, {
            icon: initialize.getIconUrl(sport, index, teamName),
          });

          marker.addEventListener("click", () =>
            initialize.showRoster(sport, teamName)
          );
          return marker;
        },
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

        let teamId = initialize.nflTeamData?.get(teamName);

        teamLocations.set(teamId, layer.getLatLng());
      });

      allTeamLocations.set(sport, teamLocations);
    });
  });
};
