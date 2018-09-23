
  let minDate = new Date();

  $('#depart').datepicker({
      showAnim: 'drop',
      numberOfMonth: 2,
      minDate: minDate,
      dateFormat: 'mm/dd/yy',
      onClose: function(selectedDate){
          $('#return').datepicker('option', 'minDate', 'selectedDate');
      }
});
  $('#return').datepicker({
      showAnim: 'drop',
      numberOfMonth: 2,
      dateFormat: 'mm/dd/yy',
      onClose: function(selectedDate){
          $('#depart').datepicker('option', 'minDate', 'selectedDate');
  }
});

//MAP SCRIPT
var endLocationLat;
var endLocationLng;
var startLocationLat;
var startLocationLng;
var directionDisplay;
var directionsService = new google.maps.DirectionsService();
var map;
var polyline = null;
var gmarkers = [];
var infowindow = new google.maps.InfoWindow();



  //    // Note: This example requires that you consent to location sharing when
  //    // prompted by your browser. If you see the error "The Geolocation service
  //    // failed.", it means you probably did not give permission for the browser to
  //    // locate you.
  //    var map, infoWindow;
  //    function initMap() {
  //      map = new google.maps.Map(document.getElementById('map'), {
  //        center: {lat: -34.397, lng: 150.644},
  //        zoom: 6
  //      });
  //      infoWindow = new google.maps.InfoWindow;

  //      // Try HTML5 geolocation.
  //      if (navigator.geolocation) {
  //        navigator.geolocation.getCurrentPosition(function(position) {
  //          var pos = {
  //            lat: position.coords.latitude,
  //            lng: position.coords.longitude
  //          };

  //          infoWindow.setPosition(pos);
  //          infoWindow.setContent('Location found.');
  //          infoWindow.open(map);
  //          map.setCenter(pos);
  //        }, function() {
  //          handleLocationError(true, infoWindow, map.getCenter());
  //        });
  //      } else {
  //        // Browser doesn't support Geolocation
  //        handleLocationError(false, infoWindow, map.getCenter());
  //      }
  //    }

  //    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  //      infoWindow.setPosition(pos);
  //      infoWindow.setContent(browserHasGeolocation ?
  //                            'Error: The Geolocation service failed.' :
  //                            'Error: Your browser doesn\'t support geolocation.');
  //      infoWindow.open(map);
  //    }
  //  </script>



// INITIALIZE MAP AND SET OPTIONS
function initMap() {
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 7,
    center: { // Set to Australia
      lat: -34.397,
      lng: 150.644
    }
  });
  //Create and control polyline
  polyline = new google.maps.Polyline({
    path: [],
    strokeColor: '#FF0000',
    strokeWeight: 3
  });
  // Calculate and display routes
  directionsDisplay.setMap(map);
  calculateAndDisplayRoute(directionsService, directionsDisplay);
  var onChangeHandler = function () {
    calculateAndDisplayRoute(directionsService, directionsDisplay);
  };
  document.getElementById('searchAround').addEventListener('click', onChangeHandler);
}

//CALUCLATE AND DISPLAY ROUTE
function calculateAndDisplayRoute(directionsService, directionsDisplay) {
  directionsService.route({
    origin: document.getElementById('origin').value,
    destination: document.getElementById('destination').value,
    travelMode: 'DRIVING'
  },
    function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        polyline.setPath([]);
        var bounds = new google.maps.LatLngBounds();
        startLocation = new Object();
        endLocation = new Object();
        directionsDisplay.setDirections(response);
        var route = response.routes[0];
        var path = response.routes[0].overview_path;
        // console.log("overview path lat/ long coordinates: "+ response.routes[0].overview_path);
        var legs = response.routes[0].legs;
        //Display distance and time in DOM
        $("#output").html("<div class='alert-info'>From: " + document.getElementById("origin").value + ".<br />To: " + document.getElementById("destination").value + ".<br /> Driving distance: " + response.routes[0].legs[0].distance.text + ".<br />Duration: " + response.routes[0].legs[0].duration.text + ".</div>");
        // startLocationLat = response.routes[0].legs[0].start_location.lat();
        // startLocationLng = response.routes[0].legs[0].start_location.lng();
        // endLocationLat = response.routes[0].legs[0].end_location.lat();
        // endLocationLng = response.routes[0].legs[0].end_location.lng();
        // console.log("Origin Latitude: " + startLocationLat);
        // console.log("Origin Longitude: " + startLocationLng);
        // console.log("Destination Latitude: " + endLocationLat);
        // console.log("Destination Longitude: " + endLocationLng);

        for (i = 0; i < legs.length; i++) {
          if (i == 0) {
            startLocation.latlng = legs[i].start_location;
            startLocation.address = legs[i].start_address;
            // marker = google.maps.Marker({map:map,position: startLocation.latlng});
            // marker = createMarker(legs[i].start_location, "start", legs[i].start_address, "green");
          }
          endLocation.latlng = legs[i].end_location;
          endLocation.address = legs[i].end_address;
          var steps = legs[i].steps;
          for (j = 0; j < steps.length; j++) {
            var nextSegment = steps[j].path;
            for (k = 0; k < nextSegment.length; k++) {
              polyline.getPath().push(nextSegment[k]);
              bounds.extend(nextSegment[k]);
            }
          }
        }

        polyline.setMap(map);
        for (var i = 0; i < gmarkers.length; i++) {
          gmarkers[i].setMap(null);
        }
        gmarkers = [];
        /////////////////////////////  THIS IS WHERE WE SET DISTANCE BETWEEN POINTS, not sure that 200000 is really 200 miles
        var points = polyline.GetPointsAtDistance(200000);
        for (var i = 0; i < points.length; i++) {
          var marker = new google.maps.Marker({
            map: map,
            position: points[i],
            title: i * 200 + 200 + " miles"
          });
          marker.addListener('click', openInfoWindow);
        }
      }
    });
}

google.maps.event.addDomListener(window, 'load', initMap);

// CREATE 200 MILE MARKERS
function createMarker(latlng, label, html, color) {
  var contentString = '<b>' + label + '</b><br>' + html;
  var marker = new google.maps.Marker({
    position: latlng,
    // draggable: true, // this part is not working correctly
    map: map,
    icon: getMarkerImage(color),
    title: label,
    zIndex: Math.round(latlng.lat() * -100000) << 5
  });
  marker.myname = label;
  gmarkers.push(marker);

  google.maps.event.addListener(marker, 'click', function () {
    infowindow.setContent(contentString);
    infowindow.open(map, marker);
  });
  return marker;
}
var icons = new Array();
icons["red"] = {
  url: "http://maps.google.com/mapfiles/ms/micons/red.png"
};

// DISPLAY MARKERS ON MAP
function getMarkerImage(iconColor) {
  if ((typeof (iconColor) == "undefined") || (iconColor == null)) {
    iconColor = "red";
  }
  if (!icons[iconColor]) {
    icons[iconColor] = {
      url: "http://maps.google.com/mapfiles/ms/micons/" + iconColor + ".png"
    };
  }
  return icons[iconColor];

}
// SHOW LAT/ LONG AND DISTANCE FROM ORIGION FOR EACH 200 MI POINT
function openInfoWindow() {
  var contentString = this.getTitle() + "<br>" + this.getPosition().toUrlValue(6);
  infowindow.setContent(contentString);
  infowindow.open(map, this);
}

//Uses a method to return an array of lat/ long points at given intervals along route
google.maps.Polyline.prototype.GetPointsAtDistance = function (miles) {
  var next = miles;
  var points = [];
  // Special cases
  if (miles <= 0) return points;
  var dist = 0;
  var olddist = 0;
  for (var i = 1;
    (i < this.getPath().getLength()); i++) {
    olddist = dist;
    dist += google.maps.geometry.spherical.computeDistanceBetween(this.getPath().getAt(i), this.getPath().getAt(i - 1));
    while (dist > next) {
      var p1 = this.getPath().getAt(i - 1);
      var p2 = this.getPath().getAt(i);
      var m = (next - olddist) / (dist - olddist);
      points.push(new google.maps.LatLng(p1.lat() + (p2.lat() - p1.lat()) * m, p1.lng() + (p2.lng() - p1.lng()) * m));
      next += miles;
    }
  }
  return points;
}

//Create autocomplete objects for inputs
var options = {
  types: ['(cities)']
}

var input1 = document.getElementById("origin");
var autocomplete1 = new google.maps.places.Autocomplete(input1, options);

var input2 = document.getElementById("destination");
var autocomplete2 = new google.maps.places.Autocomplete(input2, options);
