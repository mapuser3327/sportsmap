require([
  'esri/Map',
  'esri/views/MapView',
  'esri/layers/FeatureLayer',
  'esri/symbols/WebStyleSymbol',
  'esri/renderers/UniqueValueRenderer',
  'esri/renderers/SimpleRenderer',
  'esri/widgets/Legend',
  'esri/widgets/BasemapGallery',
  'esri/Basemap',
  'esri/widgets/Home',
  'esri/widgets/Expand',
  'esri/layers/GeoJSONLayer',
  'esri/widgets/LayerList',
  'esri/PopupTemplate',
  'esri/layers/support/LabelClass',
  'esri/symbols/TextSymbol',
  'esri/symbols/PictureMarkerSymbol',
], (
  Map,
  MapView,
  FeatureLayer,
  WebStyleSymbol,
  UniqueValueRenderer,
  SimpleRenderer,
  Legend,
  BasemapGallery,
  Basemap,
  Home,
  Expand,
  GeoJSONLayer,
  LayerList,
  PopupTemplate,
  LabelClass,
  TextSymbol,
  PictureMarkerSymbol
) => {
  const eaglesFile = 'eagles.json';

  let eaglesPlayers;
  const server = location.origin + '/';
  const map = new Map({
    // basemap: 'streets-vector',
    basemap: new Basemap({
      portalItem: {
        id: '3e23478909194c54992eaaee78b5f754', // enhanced contrast dark map
      },
    }),
  });

  const positions = new Set();
  const players = new Map();

  fetch(eaglesFile)
    .then((r) => r.json())
    .then((json) => {
      eaglesPlayers = json.features;

      eaglesPlayers.forEach((p) => {
        positions.add(p.properties.position);
        players.set(p.properties.player, p.properties);
      });
      //console.log(positions);
      //console.log(players);
    });

  const view = new MapView({
    container: viewDiv,
    map: map,
    zoom: 3,
    center: [-95, 40],
  });

  // Home widget - top-left
  const homeWidget = new Home({
    view,
  });
  view.ui.add(homeWidget, 'top-left');

  const bgExpand = new Expand({
    view,
    content: new BasemapGallery({ view }),
    expandIcon: 'basemap',
  });
  view.ui.add(bgExpand, 'top-right');

  const labelClass = new LabelClass({
    symbol: new TextSymbol({
      color: 'darkgreen',
      //backgroundColor: [255, 255, 255, 0.75],
      // borderLineColor: 'green',
      // borderLineSize: 0.5,
      yoffset: 1,
      font: {
        // autocast as new Font()
        family: 'Playfair Display',
        size: 7,
        weight: 'bold',
        textshadow: '2px 2px #ff0000',
      },
    }),
    labelPlacement: 'above-right',
    labelExpressionInfo: {
      expression: `$feature.TEAM`,
    },
  });

  const buildTeamList = function (graphics) {
    let fragment = document.getElementById('team-selection');
    // Loops through all graphics and builds the list items (which are selectable buttons)
    graphics.forEach(function (stadium, index) {
      let attributes = stadium.attributes;
      let li = document.createElement('option');
      li.value = attributes.team_short_name;
      li.textContent = attributes.team;
      fragment.appendChild(li);
    });
    // listNode.innerHTML = "";
    // listNode.appendChild(fragment);
  };

  function buildTeamTitle(feature) {
    const url =
      `${server}/teamIcons/` +
      feature.graphic.attributes['team_short_name'] +
      '.png';
    console.log(url);
    let result = `<img width="35" height="35" src="${url}" alt="{TEAM}">{TEAM}`;
    return result;
  }

  function buildTitle(feature) {
    //console.log(feature.graphic.attributes);

    let name = feature.graphic.attributes['Name'];
    let nameParts = name.toLowerCase().split(' ');
    let url = `${server}/eaglesProfilePics/${nameParts[1]}_${nameParts[0]}.webp`;
    // console.log(url);

    let result = `<img width="120" height="60" src="${url}" alt="{Name}"> {Name} : {Team} {Position}`;
    //console.log(result);
    return result;
  }
  const buildContent = (feature) => {
    let result = `<p><ul><li>{EventType} : {EventYear}
	<li>  {Team} </li>
	<li> {Position} </li>
	</ul>
	</p>
  	</div>`;
    return result;
  };

  const template = new PopupTemplate({
    title: buildTitle,
    // '<img width="120" height="60" src="{PlayerPhoto}" alt="{Name}"> {Name} : {Team} {Position}',
    content: buildContent,
    outFields: ['*'],
  });
  // "conference": "Eastern",
  // "division": "Atlantic",
  // "team": "76ers",
  // "city": "Philadelphia",
  // "arena": "Wells Fargo Center",
  const arenaTemplate = new PopupTemplate({
    title: '{city } {team}',
    outFields: ['*'],

    content: [
      {
        // It is also possible to set the fieldInfos outside of the content
        // directly in the popupTemplate. If no fieldInfos is specifically set
        // in the content, it defaults to whatever may be set within the popupTemplate.
        type: 'fields',
        fieldInfos: [
          {
            fieldName: 'arena',
            label: 'Arena Name',
          },
          {
            fieldName: 'conference',
            label: 'Conference',
          },
          {
            fieldName: 'division',
            label: 'Division',
          },
        ],
      },
    ],
  });

  const stadiumTemplate = new PopupTemplate({
    title: buildTeamTitle,
    outFields: ['*'],

    content: [
      {
        // It is also possible to set the fieldInfos outside of the content
        // directly in the popupTemplate. If no fieldInfos is specifically set
        // in the content, it defaults to whatever may be set within the popupTemplate.
        type: 'fields',
        fieldInfos: [
          {
            fieldName: 'NAME1',
            label: 'Stadium Name',
          },
          {
            fieldName: 'CONFERENCE',
            label: 'Conference',
          },
          {
            fieldName: 'DIVISION',
            label: 'Division',
          },
          {
            fieldName: 'ROOF_TYPE',
            label: 'Roof Type',
          },
        ],
      },
    ],
  });

  const eventRenderer = new UniqueValueRenderer({
    field: 'EventType',
  });
  const stadiumRenderer = new UniqueValueRenderer({
    field: 'team_short_name',
  });
  const arenaRenderer = new UniqueValueRenderer({
    field: 'team',
  });

  const addClass = function (val, renderer) {
    const url = 'teamIcons/' + val + '.png';
    const sym = new PictureMarkerSymbol({
      url: url,
      width: '35px',
      height: '35px',
    });

    renderer.addUniqueValueInfo({
      value: val,
      symbol: sym,
      label: val,
    });
  };

  const addArenaClass = function (val, renderer) {
    const url = 'nba/' + val.toLowerCase() + '.png';
    const sym = new PictureMarkerSymbol({
      url: url,
      width: '35px',
      height: '35px',
    });

    renderer.addUniqueValueInfo({
      value: val,
      symbol: sym,
      label: val,
    });
  };

  const addPlayerType = function (type, iconName, renderer) {
    renderer.addUniqueValueInfo({
      value: type,
      symbol: new WebStyleSymbol({
        name: iconName,
        styleName: 'Esri2DPointSymbolsStyle',
      }),
    });
  };

  const geojsonUrl = server + 'Players.geojson';

  addPlayerType('Birth', 'hospital', eventRenderer);
  //addPlayerType('High School Graduation', 'school', eventRenderer);
  addPlayerType('Last Year of College', 'university', eventRenderer);
  addPlayerType('Now', 'shield-2', eventRenderer);
  const playerlayer = new GeoJSONLayer({
    title: 'Eagles Players',
    url: geojsonUrl,
    latitudeField: 'Lat',
    longitudeField: 'Long',
    popupTemplate: template,
    renderer: eventRenderer,
    visible: false,
    // labelingInfo: [labelClass]
  });
  map.add(playerlayer);
  //   playerlayer.when(function () {
  //     playerlayer.queryFeatures().then((results) => {
  //       //console.log(results);
  //       results.features.forEach(function (player, index) {
  //         let attributes = player.attributes;
  //         let name = attributes['Name'];
  //         let nameParts = name.toLowerCase().split(' ');
  //         let url = `./eaglesProfilePics/${nameParts[1]}_${nameParts[0]}.webp`;
  //         player.attributes.PhotoPlayer = url;
  //       });
  //       console.log(results.features);
  //       // graphics.forEach(function (org, index) {
  //       // 	let attributes = org.attributes;
  //       // 	let name = attributes.NAME;
  //       // 	if (name.indexOf("Bucks") > -1) {
  //       // 		name = "**Pick me** " + name;
  //       // 	}
  //       // 	let li = document.createElement("li");
  //       // 	li.classList.add("panel-result");
  //       // 	li.tabIndex = 0;
  //       // 	li.setAttribute("data-result-id", index);
  //       // 	li.textContent = name + " (" + attributes.PHONE + ")";
  //       // 	fragment.appendChild(li);

  //       // });
  //     });
  //   });
  const stadiumUrl = server + 'Stadiums.geojson';

  const stadiums = new GeoJSONLayer({
    title: 'NFL Stadiums',
    url: stadiumUrl,
    latitudeField: 'LATITUDE',
    longitudeField: 'LONGITUDE',
    popupTemplate: stadiumTemplate,

    renderer: stadiumRenderer,
    // labelingInfo: [labelClass],
  });
  map.add(stadiums);

  stadiums.when(() => {
    stadiums.queryFeatures().then((results) => {
      results.features.forEach((f) => {
        addClass(f.attributes['team_short_name'], stadiumRenderer);
      });
      // buildTeamList(results.features);
    });
  });
  const arenaUrl = 'Arenas.geojson';
  const arenas = new GeoJSONLayer({
    title: 'NBA Arenas',
    url: arenaUrl,
    latitudeField: 'LATITUDE',
    longitudeField: 'LONGITUDE',
    popupTemplate: arenaTemplate,
    visible: false,
    renderer: arenaRenderer,
    // labelingInfo: [labelClass],
  });
  map.add(arenas);

  arenas.when(() => {
    arenas.queryFeatures().then((results) => {
      results.features.forEach((f) => {
        addArenaClass(f.attributes['team'], arenaRenderer);
      });
      //buildTeamList(results.features);
    });
  });

  const legend = new Legend({
    view: view,
    layerInfos: [
      {
        layer: playerlayer,
        title: 'Eagles Players',
      },
    ],
  });

  const LayerListWidgetExpand = new Expand({
    view: view,
    content: new LayerList({
      view: view,
    }),
    group: 'bottom-right',
    expanded: false,
  });
  view.ui.add([LayerListWidgetExpand], 'bottom-right');
  const lgExpand = new Expand({
    view,
    content: legend,
    expandIcon: 'legend',
    group: 'top-right',
  });
  view.ui.add(lgExpand, 'top-right');
});
