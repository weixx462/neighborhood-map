var map;
// Create a new blank array for all the listing markers.
var markers = [];
// These are the real estate listings that will be shown to the user.
// Normally we'd have these in a database instead.
var locations = [
    { title: 'Park Ave Penthouse', location: { lat: 40.7713024, lng: -73.9632393 } },
    { title: 'Chelsea Loft', location: { lat: 40.7444883, lng: -73.9949465 } },
    { title: 'Union Square Open Floor Plan', location: { lat: 40.7347062, lng: -73.9895759 } },
    { title: 'East Village Hip Studio', location: { lat: 40.7281777, lng: -73.984377 } },
    { title: 'TriBeCa Artsy Bachelor Pad', location: { lat: 40.7195264, lng: -74.0089934 } },
    { title: 'Chinatown Homey Space', location: { lat: 40.7180628, lng: -73.9961237 } }
]; 


function AppViewModel() {
	var self = this;
	this.largeInfoWindow = new google.maps.InfoWindow();
	this.searchText = ko.observable("");
	// This function populates the infowindow when the marker is clicked. We'll only allow
	// one infowindow which will open at the marker that is clicked, and populate based
	// on that markers position.
	this.populateInfoWindow = function(marker, infowindow) {
		// Check to make sure the infowindow is not already opened on this marker.
		if (infowindow.marker != marker) {
			infowindow.marker = marker;
			
			var htmlTitle = '<div>' + '<h3>' + marker.title + '</h4>';

			var foursquareAPIUrl = 'https://api.foursquare.com/v2/venues/search?ll=' +
				marker.getPosition().lat() + ',' + marker.getPosition().lng() + '&client_id=LWJP5N5FVEU1V1LKBQAJHAZW5PYERBQVVK3IKUOUA2WLD4VY&client_secret=HDB5UWGSCJ4FAZPFAZGY0RGDVQRQQHEVCZCK3IWUOPS5MNLR&v=20181205';
           
			// Foursquare API call
			$.getJSON(foursquareAPIUrl).done(function(marker) {
				var response = marker.response.venues[0];
				var street = response.location.formattedAddress[0];
				var city = response.location.formattedAddress[1];
				var country = response.location.formattedAddress[2];
				var category = response.categories[0].name;

				var htmlFoursquare =
					'<h4>Category: ' + category +
					'</h4><div>' +
					'<p>' + street + '</p>' +
					'<p>' + city + '</p>' +
					'<p>' + country + '</p>' + 
					'</div>' + '</div>';

				infowindow.setContent(htmlTitle + htmlFoursquare);
			}).fail(function() {
				alert(
					"Error when loading foursquare API." 
				);
			});

			infowindow.open(map, marker);
			// Make sure the marker property is cleared if the infowindow is closed.
			infowindow.addListener('closeclick', function () {
				infowindow.marker = null;
			});
		}
	}

	this.populateAnimateMarker = function() {
		self.populateInfoWindow(this, self.largeInfoWindow);
		this.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout((function() {
			this.setAnimation(null);
		}).bind(this), 1000);
	};

	this.initMap = function() {
		// Constructor creates a new map - only center and zoom are required.
		map = new google.maps.Map(document.getElementById('map'), {
			center: { lat: 40.7413549, lng: -73.9980244 },
			zoom: 13,
			mapTypeControl: false
		});
		var bounds = new google.maps.LatLngBounds();
		// The following group uses the location array to create an array of markers on initialize.
		for (var i = 0; i < locations.length; i++) {
			// Get the position from the location array.
			var position = locations[i].location;
			var title = locations[i].title;
			// Create a marker per location, and put into markers array.
			var marker = new google.maps.Marker({
				position: position,
				title: title,
				animation: google.maps.Animation.DROP,
				id: i
			});
			// Push the marker to our array of markers.
			markers.push(marker);
			// Create an onclick event to open an infowindow at each marker.
			marker.addListener('click', self.populateAnimateMarker);
			marker.setMap(map);
			bounds.extend(marker.position);
		}
		map.fitBounds(bounds);

	}

	this.initMap();

	this.locations = ko.computed(function() {
		var filteredLocations = [];
		for(var i = 0; i < markers.length; i++) {
			if (markers[i].title.toLowerCase().includes(this.searchText().toLowerCase())) {
				markers[i].setVisible(true);
				filteredLocations.push(markers[i]);
			} else {
				markers[i].setVisible(false);
			}
		}
		return filteredLocations;
	}, this);

}

var googleMapError = function googleError() {
    alert(
        'Google map fails to load'
    );
};

function startApp() {
    ko.applyBindings(new AppViewModel());
}