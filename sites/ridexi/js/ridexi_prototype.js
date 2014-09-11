 /*
  * ridexi_prototype.js - This file is the Javascript code to go with the RideXi
  * prototype website. The RideXi prototype website is an MVP to show prospective 
  * consumers and companies how the product will work. There are plenty of 
  * enhnacments that can be done (search for "TODO").
  *
  * This code was cobbled together from the Google MAps Javascript v3 docs.
  *
  * Do not put this code into production. This is a prototype; throw it away.
  *
  * Any questions?
  *
  * Faber Fedor (faber@faberfedor.com) 2014-08-14
  */
 
 
      var map;
      var geocoder; 
      var destinationIcon = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=D|FF0000|000000';
      var originIcon = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=O|FFFF00|000000';
      var carCompanyIcon = 'https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=O|0000FF|000000';
	  var service = new google.maps.DistanceMatrixService();
      var markers = [];
      var bounds;

      // let's hardcode some data

      var myLocation = { address : '369 Avenue Y, Brooklyn, NY 11223',
                         lat : 40.5881489,
                         lon :-73.9724117
                       }
      var destinations = carCompanies.map(function(cc) { return cc.address ; }) ;
      var center = google.maps.LatLng(myLocation.lat,myLocation.lon);

      function initialize() {
        var mapOptions = {
          center: new google.maps.LatLng(myLocation.lat,myLocation.lon),
          zoom: 16 
        };
        map = new google.maps.Map(document.getElementById("map-canvas"),
            mapOptions);

      }

      geocoder = new google.maps.Geocoder();
      // TODO put this listener onto the "Find Car Service" button instead
      // once clicked, then remove this
      google.maps.event.addDomListener(window, 'load', initialize);

      // set up things for determining distances
      var getDistance = function() {

            var UnitSystem = google.maps.UnitSystem.IMPERIAL;
            var origin1 = document.getElementById("address1").value;
            var destination1 = document.getElementById("address2").value;
            var destinations = carCompanies.map(function(cc) { return cc.address ; }) 
                destinations.unshift(destination1);

            
			service.getDistanceMatrix(
			  {
			    origins: [origin1],
			    destinations: destinations,
			    travelMode: google.maps.TravelMode.DRIVING,
			    unitSystem: UnitSystem,
			    avoidHighways: false,
			    avoidTolls: false
			  }, updatePage);
			
			function updatePage(response, status) {

              deleteMarkers();

			  if (status == google.maps.DistanceMatrixStatus.OK) {
			    var origins = response.originAddresses;
			    var destinations = response.destinationAddresses;
                var resultStr = '';
	            	
                // this resets the bounds each time
                // and is used in addMArker()
                bounds = new google.maps.LatLngBounds();
                addMarker(origins[0], 'origin');

                // get the trip distance 
			    for (var i = 0; i < origins.length; i++) {
			      var results = response.rows[i].elements;
			      for (var j = 0; j < results.length; j++) {
			        var element = results[j];
			        var distance = element.distance.text;
			        var duration = element.duration.text;
			        var from = origins[i];
			        var to = destinations[j];

                    // we're at the first one which is always the 
                    // trip destination
                    if( j == 0) {
                        tripDistance = distance;
                        tripDuration = duration;  
    			        resultStr += 'Distance from ' + from + ' to ' + to + ' is ' + distance;
                    } else {
                      updateCC(carCompanies, 
                             "address",
                             response.destinationAddresses[j], 
                             tripDistance,
                             distance);
                    }                  
                   
                  }
			    }
			  }
                // sort the CCs by distance, then cost (TODO) then display top three
                carCompanies.sort(function(a,b) {
                                          return (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0);
                                        });

                var numberOfCCsToShow = 3;
                for( var i = 0; i < numberOfCCsToShow; i++) {
                    addCCMarker(carCompanies[i]);
                }
                
                document.getElementById('results').innerHTML = resultStr;
			}
                        
        }       

		function updateCC(arr, propName, propValue, tripDistance, distance) {
		  for (var i=0; i < arr.length; i++)
            // the addresses must match EXACTLY
            // TODO we really need a fuzzy match here
		    if (arr[i][propName] == propValue) {
              arr[i].distance = distance;
              // remember, toFixed returns a string.
              arr[i].cost = +(parseFloat(tripDistance) * arr[i].costPerMile).toFixed(2); 
              return;
            }
		
		}

		function addMarker(location, type) {
		  var icon;
		  if (type == 'destination') {
		    icon = destinationIcon;
		  } else if (type == 'origin') {
		    icon = originIcon;
		  } else {
            icon = carCompanyIcon;
          }
		  geocoder.geocode({'address': location}, function(results, status) {
		    if (status == google.maps.GeocoderStatus.OK) {
		      bounds.extend(results[0].geometry.location);
		      map.fitBounds(bounds);
		      var marker = new google.maps.Marker({
		        map: map,
		        position: results[0].geometry.location,
		        icon: icon
		      });
		      markers.push(marker);
		    } else {
		      alert('Geocode was not successful for the following reason: '
		        + status);
		    }
		  });
		} 

        // split out a separate addMarker just for carCompanies
		function addCCMarker(cc, type) {
		  var icon = carCompanyIcon;
        
          var infowindow = new google.maps.InfoWindow({
                content: "holding..."

              });


		  geocoder.geocode({'address': cc.address}, function(results, status) {
		    if (status == google.maps.GeocoderStatus.OK) {
		      bounds.extend(results[0].geometry.location);
		      map.fitBounds(bounds);
		      var marker = new google.maps.Marker({
		        map: map,
		        position: results[0].geometry.location,
		        icon: icon
		      });
		      // TODO Add email functionality to the link
              marker.html = 'Company: ' + cc.name 
                            + '<br/> Cost: $' + cc.cost
                            + '<br/> <a href="#">Book ride</a>';            
              google.maps.event.addListener(marker, 'click', function () {
                infowindow.setContent(this.html);
                infowindow.open(map, this);
              });
		      markers.push(marker);

		    } else {
		      alert('Geocode was not successful for the following reason: '
		        + status);
		    }
		  });
		} 
		// Sets the map on all markers in the array.
		function setAllMap(map) {
		  for (var i = 0; i < markers.length; i++) {
		    markers[i].setMap(map);
		  }
		}
		
		// Removes the markers from the map, but keeps them in the array.
		function clearMarkers() {
		  setAllMap(null);
		}
		
		// Shows any markers currently in the array.
		function showMarkers() {
		  setAllMap(map);
		}
		
		// Deletes all markers in the array by removing references to them.
		function deleteMarkers() {
		  clearMarkers();
		  markers = [];
		}

