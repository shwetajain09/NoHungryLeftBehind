// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require underscore
//= require gmaps/google
//= require twitter/bootstrap
//= require_tree .

$(function () {
  var latLongs = {"locations":[{"latitude":"23", "longitude":"34", "position":"2"},{"latitude":"23", "longitude":"34", "position":"2"}]}
  // var latLongs = JSON.parse(data);
  // var currentPosition = initialLatLong

  var initialLatLong = {}

  $.get('truck_locations/last', function(data){
    currentPosition = {"latitude":data.latitude, "longitude":data.longitude, "position":data.position}
    drawPolyline(initialLatLong, currentPosition)
  });

  setTimeout(worker, 5000);

  var worker = function(){
    currentPosition = getNextLocationFromJson(currentPosition)
    var timeoutTime = 5000;
    if (currentPosition.pickUpLocation == "true"){
      timeoutTime = 20000
      updateLocation('pick_up_location', currentPosition)
    }
    else if (currentPosition.dropLocation == 'true'){
      timeoutTime = 30000
      updateLocation('drop_location', currentPosition)
    }
    $.ajax({
      url: '/truck_locations/last',
      type: 'PUT',
      data: {'truck_location' :currentPosition},
      success: function(data) {
        console.log("Successfully updated")
      },
      complete: function() {
        setTimeout(worker, timeoutTime);
      }
    });
  };

  var updateLocation = function(stopType, currentPosition){
    $.ajax({
      url: stopType + '/update',
      type: 'PUT',
      data: {stopType : currentPosition},
      success: function(data){
        console.log("Successfully updated")
      }
    })
  }

  var getNextLocationFromJson = function(prevPosition){
    if (latLongs.length > prevPosition.position + 1){
      currentPosition = latLongs[prevPosition.position + 1]
      currentPosition["position"] = prevPosition.position + 1
    }
    else{
      currentPosition = latLongs[0]
      currentPosition["position"] = 0
    }
  };


});
var directionsDisplay = new google.maps.DirectionsRenderer();
var directionsService = new google.maps.DirectionsService();

function drawPolyline(startLocation,destinationLocation) {
  var origin      = new google.maps.LatLng(startLocation.latitude, startLocation.longitude);
  var destination = new google.maps.LatLng(destinationLocation.latitude, destinationLocation.longitude);
  var request = {
    origin:      origin,
    destination: destination,
    travelMode:  google.maps.TravelMode.DRIVING
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    }
  });
}

function initializeMap(locations)
{

   var truckRouteCoordinates = [];
    for(i =0;i<locations.length;i++)
    { 
      truckRouteCoordinates.push(new google.maps.LatLng(locations[i]["lat"], locations[i]["lng"]));
    }
  var mapOptions = {
    zoom: 3,
    center: new google.maps.LatLng(0, -180),
    mapTypeId: google.maps.MapTypeId.DRIVING
  };
  var truckPath = new google.maps.Polyline({
    path: truckRouteCoordinates,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 2.0,
    strokeWeight: 4
  });

  var handler = Gmaps.build('Google');

  handler.buildMap({ provider: {}, internal: {id: 'feed_map'}}, function(){
    markers = handler.addMarkers(locations);
    handler.bounds.extendWith(markers);
    handler.fitMapToBounds();
    directionsDisplay.setMap(handler.getMap());
    truckPath.setMap(handler.getMap());
  });
}


