//FIREBASE
var config = {
    apiKey: "AIzaSyCc881NFW8fdbftLA5xD1OesxBXNHrAJSY",
    authDomain: "mhlocationdatabase-e7c61.firebaseapp.com",
    databaseURL: "https://mhlocationdatabase-e7c61.firebaseio.com",
    storageBucket: "mhlocationdatabase-e7c61.appspot.com",
    messagingSenderId: "650519975440"
  	};
firebase.initializeApp(config);

var map;

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
}
