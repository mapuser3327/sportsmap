import * as map from "./map.js";
import * as initialize from "./initData.js";

export const init = () => {
  initialize.init();

  map.initializeMap();

  // define function to handle click events on  features
  const playersOnEachFeature = (feature, layer) => {
    layer.on({
      click: function (e) {
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
  };
};
