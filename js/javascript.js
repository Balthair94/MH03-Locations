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

function initMap() {
	var colima = {lat: 19.233333, lng: -103.716667};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: colima
       });

    google.maps.event.addListener(map, 'click', function(event) {
   		placeMarker(event.latLng);
   		console.log(event.latLng);
	});

	//writeUserData();
}


function placeMarker(location){
	var marker = new google.maps.Marker({
		position: location,
       	map: map
    	});
}

function writeUserData(){
	var userData = {
		username:"baltazar",
		userage:22,
		useremail:"archer@baltazar.com"
	};

	// Get a key for a new Post.
  	var newPostKey = database.ref().child('users').push().key;

  	// Write the new post's data simultaneously in the posts list and the user's post list.
  	var updates = {};
  	updates['/users/' + newPostKey] = userData;

  	database.ref().update(updates);
}
