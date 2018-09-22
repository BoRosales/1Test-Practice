$(document).ready(function(){
//---Global Variables---

//---Input Variables---
var input1 = document.getElementById("origin");
var autocomplete1 = new google.maps.places.Autocomplete(input1, options);
var input2 = document.getElementById("destination");
var autocomplete2 = new google.maps.places.Autocomplete(input2, options);

//---Long and Lat global variables---
var endLocationLat;
var endLocationLng;
var startLocationLat;
var startLocationLng;


//---Round Trip & One Way Button---
$('.one-way-button').on('click', function(){
    $('#return').hide();
    });
$('.round-trip-button').on('click', function(){
    $('#return').show();
});

//---MAP SCRIPT---
//set options
var myLatLng = { lat: 30.2672, lng: -97.7431 }; // Set to Austin, could set to user's location
var mapOptions = {
    center: myLatLng,
    zoom: 7,
    mapTypeId: google.maps.MapTypeId.ROADMAP
};

//Create map
var map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);

//Create DirectionsService and DirectionsRender objects, bind DirectionsRenderer to map
var directionsService = new google.maps.DirectionsService();
var directionsDisplay = new google.maps.DirectionsRenderer();

directionsDisplay.setMap(map);

//Calculate route function
function calcRoute() {
    var request = {
        origin: document.getElementById("origin").value,
        destination: document.getElementById("destination").value,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL
        ////////////////////////////////////////////// We could add "waypoints" or "avoid tolls/ highways" optons here
    }

    //Pass request to route method
    directionsService.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {

            //Get distance, time, and lat/ long.  Display distance and time in DOM
            $("#output").html("<div class='alert-info'>From: " + document.getElementById("origin").value + ".<br />To: " + document.getElementById("destination").value + ".<br /> Driving distance: " + result.routes[0].legs[0].distance.text + ".<br />Duration: " + result.routes[0].legs[0].duration.text + ".</div>");
            endLocationLat = result.routes[0].legs[0].end_location.lat();
            endLocationLng = result.routes[0].legs[0].end_location.lng();
            startLocationLat = result.routes[0].legs[0].start_location.lat();
            startLocationLng = result.routes[0].legs[0].start_location.lng();
            //  console.log(endLocationLat);
            //  console.log(endLocationLng);
            //  console.log (startLocationLat);
            //  console.log(startLocationLng);

            //Display route
            directionsDisplay.setDirections(result);
        } else {
            //Delete route from map
            directionsDisplay.setDirections({ routes: [] });
            //Center map in Austin (could center to user)
            map.setCenter(myLatLng);
            //show error message
            $("#output").html("<div class='alert-danger'>Could not retrieve driving distance.</div>");
        }
    });

}

//Create autocomplete objects for inputs
var options = {
    types: ['(cities)']
}



//---------FUNCTIONS-----------------

    // DATE SCRIPT
    let minDate = new Date();

    $('#depart').datepicker({
        showAnim: 'drop',
        numberOfMonth: 1,
        minDate: minDate,
        dateFormat: 'mm/dd/yy',
        onClose: function (selectedDate) {
            $('#return').datepicker('option', 'minDate', 'selectedDate');
        }
    });
    $('#return').datepicker({
        showAnim: 'drop',
        numberOfMonth: 1,
        dateFormat: 'mm/dd/yy',
        onClose: function (selectedDate) {
            $('#depart').datepicker('option', 'minDate', 'selectedDate');
        }
    }); 
});