let minDate = new Date();
let airlineCodesJson = [];

$('#depart').datepicker({
  showAnim: 'drop',
  numberOfMonth: 1,
  minDate: minDate,
  dateFormat: 'dd/mm/yy',
  onClose: function (selectedDate) {
    $('#depart').datepicker('option', 'minDate', selectedDate);
  }
});

// To use for return trips (Phase 2)
// $('#return').datepicker({
//   showAnim: 'drop',
//   numberOfMonth: 1,
//   minDate: new Date,
//   dateFormat: 'dd/mm/yy',
//   onClose: function (selectedDate) {
//     $('#return').datepicker('option', 'minDate', selectedDate);
//   }
// });

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

// INITIALIZE MAP AND SET OPTIONS
function initMap() {
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 7,
    center: { // Set to Austin
      lat: 30.2672,
      lng: -97.7431
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
    $('.spinner').removeClass('hidden');
    displayAirInfo();
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
        var legs = response.routes[0].legs;
        var totalDistance = response.routes[0].legs[0].distance.value;
        var meters = 1609;
        var convert = totalDistance / meters;
        // console.log(convert);
        var mpg = 25;
        var avgCost = 2.85;
        var neededGas = convert / mpg;
        var totalCost = neededGas * avgCost;
        var finalCost = (Math.round(totalCost * 100) / 100);

        //Display distance and time in DOM
        $("#drivingCard").html("<div class='info'>Startin' : " + document.getElementById("origin").value
          + "<br>Goin' : " + document.getElementById("destination").value
          + "<br>Distance: " + response.routes[0].legs[0].distance.text
          + "<br>Time: " + response.routes[0].legs[0].duration.text
          + "<br>Cost: $" + finalCost + "<br></div>");

        for (i = 0; i < legs.length; i++) {
          if (i == 0) {
            startLocation.latlng = legs[i].start_location;
            startLocation.address = legs[i].start_address;
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

        //321100 meters = about 200 miles
        var points = polyline.GetPointsAtDistance(321100);
        for (var i = 0; i < points.length; i++) {
          var marker = new google.maps.Marker({
            map: map,
            position: points[i],
            title: i * 200 + 200 + " miles"
          });
          marker.addListener('click', openInfoWindow);
          gmarkers.push(marker);
        }
      }
    });
}

google.maps.event.addDomListener(window, 'load', initMap);

// CREATE GAS STOPS EVERY 200 MILES
function createMarker(latlng, label, html, color) {
  var contentString = '<b>' + label + '</b><br>' + html;
  var marker = new google.maps.Marker({
    position: latlng,
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

// SHOW LAT/ LONG AND DISTANCE FROM ORIGIN FOR EACH 200 MI POINT
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

  // Create promise to push gas prices to DOM in correct order
  var promises = [];
  for (var i = 0; i < points.length; i++) {
    // console.log(points[i].lat(), points[i].lng());

    var gasLat = points[i].lat();
    var gasLng = points[i].lng();

    // Create myGasFeed API URL 
    var gasURL = "http://api.mygasfeed.com/stations/radius/"
      + gasLat + "/" + gasLng
      + "/15/reg/price/esmbi7wobr.json?";

    promises.push($.get(gasURL))
  }

  // For loop to append myGasFeed return to DOM
  Promise.all(promises).then(function (ajaxResults) {
    $('.spinner').addClass('hidden');

    // console.log(ajaxResults);
    for (var j = 0; j < ajaxResults.length; j++) {
      if (ajaxResults[j].stations.length === 0) {
        $("#gasStationsCard").append("<div class='info2'>This Stop Does Not Have Any Gas Stations");
      }
      else {
        // store stuff in card = []
        let ctn = $("<div class='info2'>")
        for (let k = 0; k < 3; k++) {
          let div = $("<div class='card-body style='width: 18rem;'><hr></div>")
          if (ajaxResults[j].stations[k]) {
            div.append(
              ajaxResults[j].stations[k].station + "<br>" +
              "Regular: $" + ajaxResults[j].stations[k].reg_price + "<br>" +
              ajaxResults[j].stations[k].address + "<br>" +
              ajaxResults[j].stations[k].city + ", " +
              ajaxResults[j].stations[k].region)

          }
          ctn.append(div);
        } // done with loop
        ctn.append("<hr>");
        $("#gasStationsCard").append(ctn);
        // console.log(ctn);
      }
    }
  })
  return points;
}

//CREATE AUTOCOMPLETE
var options = {
  types: ['(cities)']
}

var input1 = document.getElementById("origin");
var autocomplete1 = new google.maps.places.Autocomplete(input1, options);
var input2 = document.getElementById("destination");
var autocomplete2 = new google.maps.places.Autocomplete(input2, options);

// CREATE FUNCTION TO DISPLAY FLIGHT INFORMATION (SKYPICKER API)
function displayAirInfo() {
  var originCity = document.getElementById("origin").value;
  var destinationCity = document.getElementById("destination").value;
  var dateFrom = document.getElementById("depart").value;
  let americanDateFormat = moment(dateFrom, 'DD/MM/YYYY').format("MMMM Do, YYYY");

  const airURL =
    "https://api.skypicker.com/flights?curr=USD&typeFlight=round&flyFrom=" + originCity
    + "&to=" + destinationCity
    + "&dateFrom=" + dateFrom
    + "&dateTo=" + dateFrom
    + "&partner=picky";

  // Return json from Skypicker API;
  $.get(airURL).then(response => {

    // variables for IATA codes
    airline0 = response.data[0].airlines[0];
    airline1 = response.data[1].airlines[0];
    airline2 = response.data[2].airlines[0];
    departureAirport = response.data[0].flyFrom;
    arrivalAirport = response.data[0].flyTo;

    //Return json file to convert airline code to airline name (airlines.json file)
    const airlineJsonFile = "assets/airlines.json";
    $.get(airlineJsonFile).then(results => {

      airlineCodesJson = results;
      airlineCode0 = airline0;
      airlineCode1 = airline1;
      airlineCode2 = airline2;
      departureCode = departureAirport;
      arrivalCode = arrivalAirport;

      // Writes results to DOM
      $("#flightResultsCard").html("<div class='info'>"
        + "<br>Startin':  " + findByCode(departureCode, null, null, null, null, airlineCodesJson)
        + "<br>Going':  " + findByCode(null, arrivalCode, null, null, null, airlineCodesJson)
        + "<br>Leavin':  " + americanDateFormat
        + "<br><hr>Airline: " + findByCode(null, null, airlineCode0, null, null, airlineCodesJson)
        + "<br>Flight price: USD $" + response.data[0].price
        + "<br>Travel Time: " + response.data[0].fly_duration
        + "<br><a href='" + response.data[0].deep_link + "'><button>Purchase</button></a>"
        + "<br><hr>Airline: " + findByCode(null, null, null, airlineCode1, null, airlineCodesJson)
        + "<br>Flight price: USD $" + response.data[1].price
        + "<br>Travel Time: " + response.data[1].fly_duration
        + "<br><a href='" + response.data[1].deep_link + "'><button>Purchase</button></a>"
        + "<br><hr>Airline: " + findByCode(null, null, null, null, airlineCode2, airlineCodesJson)
        + "<br>Flight price: USD $" + response.data[2].price
        + "<br>Travel Time: " + response.data[2].fly_duration
        + "<br><a href='" + response.data[2].deep_link + "'><button>Purchase</button></a></div>");
    });
  });

  function findByCode(departureCode, arrivalCode, airlineCode0, airlineCode1, airlineCode2, json) {
    if (departureCode) {
      for (let i = 0; i < json.length; i++) {
        if (departureCode === json[i].airport.code) {
          return json[i].airport.name
        }
      }
    } else if (arrivalCode) {
      for (let i = 0; i < json.length; i++) {
        if (arrivalCode === json[i].airport.code) {
          return json[i].airport.name
        }
      }
    } else if (airlineCode0) {
      for (let i = 0; i < json.length; i++) {
        if (airlineCode0 === json[i].carrier.code) {
          return json[i].carrier.name
        }
      }
    } else if (airlineCode1) {
      for (let i = 0; i < json.length; i++) {
        if (airlineCode1 === json[i].carrier.code) {
          return json[i].carrier.name
        }
      }
    } else if (airlineCode2) {
      for (let i = 0; i < json.length; i++) {
        if (airlineCode2 === json[i].carrier.code) {
          return json[i].carrier.name
        }
      }
    }
  }
}





