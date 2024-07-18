var mainMap, modalMap, chosenLocation;
var treeDataLayer, addTreeLayer, deleteTreeLayer;
var isInDeleteMode = false;
var selectedTreeMarker = null;
var selectedUprootType = "";

// Custom icons for different markers
var greenIcon = new L.Icon({
  iconUrl: 'https://example.com/green-marker.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

var purpleIcon = new L.Icon({
  iconUrl: 'https://example.com/purple-marker.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

var orangeIcon = new L.Icon({
  iconUrl: 'https://example.com/orange-marker.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function initializeModalMap() {
  if (!modalMap) {
    modalMap = L.map("treeLocationMap").setView([19.0211, 72.8710], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(modalMap);

    var geocoder = L.Control.geocoder({
      defaultMarkGeocode: false,
      placeholder: "Search for location...",
      showResultIcons: true,
    }).addTo(modalMap);

    geocoder.on("markgeocode", function (e) {
      var latlng = e.geocode.center;
      modalMap.setView(latlng, 16);
      if (chosenLocation) {
        modalMap.removeLayer(chosenLocation);
      }
      chosenLocation = L.marker(latlng).addTo(modalMap);
    });

    modalMap.on("click", function (e) {
      if (chosenLocation) {
        modalMap.removeLayer(chosenLocation);
      }
      chosenLocation = L.marker(e.latlng).addTo(modalMap);
    });
  } else {
    modalMap.invalidateSize();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  mainMap = L.map("map").setView([19.0211, 72.8710], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }).addTo(mainMap);

  treeDataLayer = L.layerGroup().addTo(mainMap);
  addTreeLayer = L.layerGroup().addTo(mainMap);
  deleteTreeLayer = L.layerGroup().addTo(mainMap);

  // Get user location and set it on the map
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var latlng = [position.coords.latitude, position.coords.longitude];
      mainMap.setView(latlng, 16);

      var userLocationMarker = L.marker(latlng, { icon: greenIcon }).addTo(mainMap)
        .bindPopup("You are here")
        .openPopup();
    });
  }

  $("#addTreeModal").on("shown.bs.modal", initializeModalMap);

  $("#addTreeForm").on("submit", function (e) {
    e.preventDefault();
    var treeName = $("#tree-name").val();
    var treeAge = $("#tree-age").val();
    var treeHeight = $("#tree-height").val();

    if (chosenLocation) {
      var treeMarker = L.marker(chosenLocation.getLatLng(), { icon: greenIcon })
        .bindPopup(
          "<b>" + treeName + "</b><br>Age: " + treeAge + "<br>Height: " + treeHeight
        )
        .addTo(treeDataLayer);

      $("#addTreeModal").modal("hide");
      $("#addTreeForm")[0].reset();
      modalMap.removeLayer(chosenLocation);
      chosenLocation = null;
    } else {
      alert("Please select a location for the tree.");
    }
  });

  mainMap.on("click", function (e) {
    if (isInDeleteMode) {
      if (selectedTreeMarker) {
        mainMap.removeLayer(selectedTreeMarker);
        selectedTreeMarker = null;
        isInDeleteMode = false;
      } else {
        selectedTreeMarker = L.marker(e.latlng).addTo(deleteTreeLayer);
      }
    }
  });

  $("#deleteTreeForm").on("submit", function (e) {
    e.preventDefault();
    var treeName = $("#tree-name-delete").val();

    if (selectedTreeMarker) {
      mainMap.removeLayer(selectedTreeMarker);
      selectedTreeMarker = null;
    } else {
      alert("Please select a tree to delete.");
    }
  });

  $(".upvote").on("click", function () {
    if (!selectedUprootType) {
      selectedUprootType = "upvote";
      if (selectedTreeMarker) {
        selectedTreeMarker.setIcon(purpleIcon);
      }
    }
  });

  $(".downvote").on("click", function () {
    if (!selectedUprootType) {
      selectedUprootType = "downvote";
      if (selectedTreeMarker) {
        selectedTreeMarker.setIcon(orangeIcon);
      }
    }
  });

  $("#addTreeModal").on("hide.bs.modal", function () {
    modalMap.removeLayer(chosenLocation);
    chosenLocation = null;
  });
});

function enableDeleteMode() {
  isInDeleteMode = true;
  selectedTreeMarker = null;
}
