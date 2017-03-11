//FIREBASE
var config = {
    apiKey: "AIzaSyCc881NFW8fdbftLA5xD1OesxBXNHrAJSY",
    authDomain: "mhlocationdatabase-e7c61.firebaseapp.com",
    databaseURL: "https://mhlocationdatabase-e7c61.firebaseio.com",
    storageBucket: "mhlocationdatabase-e7c61.appspot.com",
    messagingSenderId: "650519975440"
  	};
firebase.initializeApp(config);

var storage = firebase.storage();
var database = firebase.database();

var map;

var arrayLocations = new Array();

function initMap() {
	var colima = {lat: 19.233333, lng: -103.716667};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: colima
       });

    google.maps.event.addListener(map, 'click', function(event) {
   		placeMarker(event.latLng);
	});
}


function placeMarker(location){
	var marker = new google.maps.Marker({
		position: location,
       	map: map
    	});
	writeLocationData(location.lat(), location.lng());
}

function writeLocationData(lat, lng){
	var tempID = getID();

	var locationData = {
		locationID:tempID,
		locationLat:lat,
		locationLng:lng
	};

  	var newPostKey = database.ref().child('locations').push().key;

  	var updates = {};
  	updates['/locations/' + newPostKey] = locationData;

  	database.ref().update(updates);

  	addLocationToArray(locationData);  	
}

function getID() {
	if (arrayLocations.length == 0) {return 1}
	else {return arrayLocations.length + 1}
}

function gotData(data) {
	var query = database.ref("locations");
	
	query.once("value").then(function(snapshot) {
		if (snapshot.val() == null) {console.log("NO DATA")}
		else {
				snapshot.forEach(function(childSnapshot) {
	     			var location_id = childSnapshot.child("locationID").val();
	      			var location_lat = childSnapshot.child("locationLat").val();
	      			var location_lng = childSnapshot.child("locationLng").val();

	      			var locationData = {
							locationID:location_id,
							locationLat:location_lat,
							locationLng:location_lng
						};

	      			addLocationToArray(locationData);
	      			showMarker(location_id, location_lat, location_lng);
  				});

  				if (isArrayAvailable()) {drawPolyline(getCoordinatesArray());}
			}
		});
	
}

function showMarker(id, latitude, longitude) {
	var marker = new google.maps.Marker({
			position: {lat: latitude, lng: longitude},
	       	map: map
    	});
}

function addLocationToArray(locationObject) {
	arrayLocations.push(locationObject);
	if (isArrayAvailable()) {drawPolyline(getLastCoordinates());}
}

function drawPolyline(points) {
	var path = new google.maps.Polyline({
	    	path: points,
	    	geodesic: true,
	    	strokeColor: '#FFDE50',
	    	strokeOpacity: 1.0,
	    	strokeWeight: 2
	  	});
  	path.setMap(map);
}

function getCoordinatesArray() {
	var arrayCoordinates = new Array();
	for (var i = 0; i < arrayLocations.length; i++) {
		var object = {lat: arrayLocations[i].locationLat, lng:arrayLocations[i].locationLng};
		arrayCoordinates.push(object);
	}
	return arrayCoordinates;
}

function getLastCoordinates() {
	var arrayCoordinates = new Array();
	var lastElement = arrayLocations[arrayLocations.length-1];
	var object = {lat:lastElement.locationLat, lng:lastElement.locationLng};
	arrayCoordinates.push(object);

	lastElement = arrayLocations[arrayLocations.length-2];
	object = {lat:lastElement.locationLat, lng:lastElement.locationLng};
	arrayCoordinates.push(object);

	return arrayCoordinates;
}

function isArrayAvailable() {
	if (arrayLocations.length >= 2) {return true;}
	else {return false;}
}
