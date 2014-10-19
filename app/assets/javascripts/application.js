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
//= require jquery-ui
//= require jquery.backgroundSize
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
    $.ajax({
      url: '/truck_locations/last',
      type: 'PUT',
      data: currentPosition, 
      success: function(data) {
        $('.result').html(data);
      },
      complete: function() {
        setTimeout(worker, 5000);
      }
    });
  };

  var getNextLocationFromJson = function(prevPosition){
    if (latLongs.length > prevPosition.position + 1){
      currentPosition = latLongs[prevPosition.position + 1]
      currentPosition["position"] = prevPosition.position + 1
    }
    else{
      currentPosition = latLongs[0]
      currentPosition["position"] = 0
    }
    // for (var location = 0; location < latLongs.length; location++){
    //   if (location.latitude == currentPosition["latitude"] && location.longitude == currentPosition["longitude"]){
    //     currentPosition = {"latitude" : location.latitude, "longitude":location.longitude}
    //     return false;
    //   }
    // }
  };
	
	$(".header-outer, .panel1, .panel2, .panel3").css({backgroundSize: "cover"});
 
	$('.close-spread, .open-close').click(function () {
	    // Set the effect type
	    var effect = 'slide';
	    // Set the options for the effect type chosen
	    var options = { direction: 'right' };
	    // Set the duration (default: 400 milliseconds)
	    var duration = 700;
	    $('#toggle').toggle(effect, options, duration);
	});


	$( "#slider-range-min" ).slider({
	range: "min",
	value: 37,
	min: 1,
	max: 700,
	slide: function( event, ui ) {
	$( "#amount" ).val( ui.value );
	}
	});
	$( "#amount" ).val( "$" + $( "#slider-range-min" ).slider( "value" ) );


	 $( "#datepicker" ).datepicker({
	showOn: "button",
	buttonImageOnly: false,
	buttonText: "Select date"
	});
	
	$( "#speed" ).selectmenu();

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


var lineSymbol = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 8,
    strokeColor: '#393'
  };

var symbolTwo = {
    path: 'M -1,0 A 1,1 0 0 0 -3,0 1,1 0 0 0 -1,0M 1,0 A 1,1 0 0 0 3,0 1,1 0 0 0 1,0M -3,3 Q 0,5 3,3',
    strokeColor: '#00F',
    rotation: 135
  };

  


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
    strokeWeight: 4,
    icons: [{
      icon: symbolTwo,
      offset: '100%'
    }]
  });

  var handler = Gmaps.build('Google');

  handler.buildMap({ provider: {}, internal: {id: 'feed_map'}}, function(){
    markers = handler.addMarkers(locations);
    handler.bounds.extendWith(markers);
    handler.fitMapToBounds();
    directionsDisplay.setMap(handler.getMap());
    truckPath.setMap(handler.getMap());
    //line.setMap(handler.getMap());
  });
  animateCircle();
    function animateCircle() {
    var count = 0;
    window.setInterval(function() {
      count = (count + 1) % 200;

      var icons = truckPath.get('icons');
      icons[0].offset = (count / 2) + '%';
      truckPath.set('icons', icons);
  }, 2000);
}
}


