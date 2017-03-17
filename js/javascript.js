//FIREBASE
var config = {
    apiKey: "AIzaSyCc881NFW8fdbftLA5xD1OesxBXNHrAJSY",
    authDomain: "mhlocationdatabase-e7c61.firebaseapp.com",
    databaseURL: "https://mhlocationdatabase-e7c61.firebaseio.com",
    storageBucket: "mhlocationdatabase-e7c61.appspot.com",
    messagingSenderId: "650519975440"
  	};
firebase.initializeApp(config); //FIREBASE CONECTION

var database = firebase.database(); //DATABASE

var map; //GOOGLE MAP

var arrayLocations = new Array(); //LOCATIONS IN THE DATABASE
var markers = new Array(); //MARKES IN THE MAP
var flightPath = new Array(); //POLYLINES IN THE MAP

var currentMusic = null;
var audioArray = ['firstAudio','secAudio','thAudio'];

/*Map gets loaded*/
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

/*Show a merker in the current place where the user made 
click*/
function placeMarker(location){
	var marker = new google.maps.Marker({
		position: location,
		label: getID().toString(),
       	map: map
    	});
	markers.push(marker); //ADD MARKER TO THE ARRAY MARKERS
	markerClick(marker);
	writeLocationData(location.lat(), location.lng());
}

/*Save marker into the database*/
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

	      			arrayLocations.push(locationData);
	      			showMarker(location_id, location_lat, location_lng);
  				});
  				if (isArrayAvailable()) {drawPolyline(getCoordinatesArray());tableData();}
			}
		});
	
}

/*Use to show all the markers that are in the database*/
function showMarker(id, latitude, longitude) {
	var marker = new google.maps.Marker({
			position: {lat: latitude, lng: longitude},
			label: id.toString(),
	       	map: map
    	});
	markers.push(marker);
	markerClick(marker);
}

/*Saving Locations localy*/
function addLocationToArray(locationObject) {
	arrayLocations.push(locationObject);
	if (isArrayAvailable()) {drawPolyline(getLastCoordinates()); addLocationToTable();}
}

function drawPolyline(points) {
	var path = new google.maps.Polyline({
	    	path: points,
	    	geodesic: true,
	    	strokeColor: '#FF0000',
	    	strokeOpacity: 1.0,
	    	strokeWeight: 2
	  	});
  	path.setMap(map); 
  	flightPath.push(path);//save polylines into arrar
}

/*Get all the coordinates to draw all the polylines between
  markers*/
function getCoordinatesArray() {
	var arrayCoordinates = new Array();
	for (var i = 0; i < arrayLocations.length; i++) {
		var object = {lat: arrayLocations[i].locationLat, lng:arrayLocations[i].locationLng};
		arrayCoordinates.push(object);
	}
	return arrayCoordinates;
}

/*Coordinates use them to draw a new polyline
  when the user gives us a new marker in the map*/
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

/*To know if it is possible to show distance between
  markers, we need more than one*/
function isArrayAvailable() {
	if (arrayLocations.length >= 2) {return true;}
	else {return false;}
}
//button
function cleanMap(){
	//DELETE CONTENT IN DATABASE
	database.ref().child('locations').remove();

	//CLEAN MAP
	deleteMarkers();
	deletePolylines();

	//CLEAN ARRYALOCATIONS
	arrayLocations = new Array();

	//Delete tableContent and created again
	document.getElementById("tableContent").remove();
	var tParent = document.getElementById("tableParent");
	var tBody = document.createElement("TBODY");
	tBody.id = "tableContent";
	tParent.appendChild(tBody);


}

/*To delete the markers it is necessary save 
  them in one array*/
function deleteMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

/*To delete the polylines it is necessary save 
  them in one array*/
function deletePolylines() {
	for(var i = 0; i < flightPath.length; i++){
		var path = flightPath[i];
		path.setMap(null);
	}
}

function tableData() {
	var tBodyContent = document.getElementById("tableContent");
		//Marks
	for(var i = 0; i < arrayLocations.length -1; i++){
		var objectA = arrayLocations[i];
		var objectB = arrayLocations[i+1];

		var tr = createRecord(objectA, objectB);
		
		//putting the data into table 
		tBodyContent.appendChild(tr);
	}
}

function getDistance(pointA, pointB) {
		var rad = function(x) {
  			return x * Math.PI / 180;
		};
		var EarthR = 6378137; // Earth’s mean radius in meter
	  	var distanceLat = rad(pointB.lat - pointA.lat);
	  	var distanceLong = rad(pointB.lng - pointA.lng);
	  	var a = Math.sin(distanceLat / 2) * Math.sin(distanceLat / 2) +
	    Math.cos(rad(pointA.lat)) * Math.cos(rad(pointB.lat)) *
	    Math.sin(distanceLong / 2) * Math.sin(distanceLong / 2);
	  	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	  	var d = EarthR * c;
	  	var km = d/1000;

	  	return Math.round(km * 100) / 100;
}

function addLocationToTable(){
	var tBodyContent = document.getElementById("tableContent");

	var objectA = arrayLocations[arrayLocations.length-2];
	var objectB = arrayLocations[arrayLocations.length-1];

	var tr = createRecord(objectA, objectB);

	tBodyContent.appendChild(tr);
}

function createRecord(objectA, objectB) {
	var tr = document.createElement('TR');

	var tdPointA = document.createElement('TD');
	tdPointA.appendChild(document.createTextNode(objectA.locationID));
	var tdPointB = document.createElement('TD');
	tdPointB.appendChild(document.createTextNode(objectB.locationID));
	var tdDistance = document.createElement('TD');

	var pointA = {lat:objectA.locationLat, lng:objectA.locationLng};
	var pointB = {lat:objectB.locationLat, lng:objectB.locationLng};

	tdDistance.appendChild(document.createTextNode(getDistance(pointA,pointB) + " KM"));

	tr.appendChild(tdPointA); tr.appendChild(tdPointB); tr.appendChild(tdDistance);
	return tr;
}

function markerClick(marker) {
	marker.addListener('click', function() {
		
		var item = audioArray[Math.floor(Math.random()*audioArray.length)];
    if (currentMusic != null) {currentMusic.pause();}
		currentMusic = document.getElementById(item);
    currentMusic.play();
  });
}







