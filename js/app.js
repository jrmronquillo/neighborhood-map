/*jshint esversion: 6 */

/** Create a new blank array for all the listing markers. */
const markers = [];
let map;

/** Display message if google map api fails to load
 *  https://www.w3schools.com/jsref/event_onerror.asp
 */
const $mapElem = $('#map-error');
function err(){
    const errorMessage = 'Error with loading google maps';
    $mapElem.text(errorMessage);
}

/** This function initializes given location data */
function initMap(){
    /** initialize three authentication variables to use in building foursquare api url */
    const client_id = '02OYHMKPLDMJVUVLS0ECHYEKQ50YMOXXUR3ZDSGY2EJFNH04';
    const client_secret = 'HYFR4GQPJPHRQH1N3GRXLLR3SXBYSWR1WCZECTDFWTI5FBLH';
    const version = '20161016';


    /** Refactored app - by moving location data to json file and used getJSON ajax call to grab data
      * http://api.jquery.com/jquery.getjson/
      */
    $.getJSON("js/locationsList.json",function( jsonData ){

        /** Represents a Place
          * @constructor
          * @param {object} data - place information
          */
        const Place = function(data){
            this.title = ko.observable(data.title);
            this.position = ko.observable(data.location);
            this.marker = '';
            this.checkins ='-';
            this.address ='-';
        };

        const locationsViewModel = function() {
            const self = this;

            this.places = ko.observableArray([]);

            /** for each item in the locationsList, create Place object and store in places observable array */
            //locationsList.forEach(function(individualPlace){
            //    self.places.push( new Place(individualPlace) );
            //});

            /**Re-factored app to use data in a separate .json file */
            //console.log(jsonData.locationsList);
            jsonData.locationsList.forEach(function(jsonItem){
                self.places.push( new Place( jsonItem ) );
            });

            /** Observable to display error message if foursquare api fails to load, empty by default
              *  Wired to a div in the list view
              */
            this.fsError = ko.observable();


            /** marker styling */
            const defaultIcon = makeMarkerIcon('90A1B7');

            /** Create a "highlighted location" marker color for when the user
              * mouses over the marker.
              */
            const highlightedIcon = makeMarkerIcon('FFB99B');

            //Take title, lat and lng from each location in locationsList and use foursquare api to grab additional data
            this.places().forEach(function(individualItem){
                //Use individual place attributes to build foursquare api request for additional information
                const query = individualItem.title();
                const latval = individualItem.position().lat;
                const lngval = individualItem.position().lng;
                const foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll='+latval+','+lngval+'&query='+query+
                                  '&intent=match&client_id='+ client_id +'&client_secret='+ client_secret + '&v=' + version;

                /** Get Foursquare JSON response and store values in each location Place object */
                $.getJSON(foursquareURL, function(data){
                    let results = data.response.venues;
                    for(let i=0;i<results.length;i++){
                        self.locationName = results[i].name;
                        individualItem.checkins = results[i].stats.checkinsCount;
                        individualItem.address = results[i].location.address;
                    }
                }).error(function(e){
                    /** display message when there is an error in getting data from api
                      * Wired to ko observable fsError
                      */
                    self.fsError('Attention: Foursquare API request error occurred, additional location data will not be available');
                });

                /** Use Place attributes to create google maps marker
                  * and store marker information in Place object and Markers array
                  */
                const marker = new google.maps.Marker({
                    position: individualItem.position(),
                    title: individualItem.title(),
                    animation: google.maps.Animation.DROP,
                    icon: defaultIcon
                });
                individualItem.marker=marker;
                markers.push(individualItem.marker);

            });

            this.currentPlace = ko.observable( self.places()[0] );
            //this.currentPlace = ko.observable( self.data()[0] )
            this.searchinput = ko.observable("");
            this.toggleState = ko.observable(true);

          /** Ko computed observable to update view with matching results
            * when text is inputted into filter search box
            */
            this.filteredItems = ko.computed(function() {
                const filter = self.searchinput().toLowerCase();
                if (!filter) {
                    //make all markers visible if search filter is empty
                    self.places().forEach(function(each){
                        each.marker.setVisible(true);
                    });
                    return self.places();
                } else {
                    //clear map of all visible markers
                    self.places().forEach(function(each){
                        each.marker.setVisible(false);
                    });

                    /** modified search filter to be more loose by using indexOf to detect matches in any position of the title strings
                      * Used example from link provided in previous code review:
                      * https://codepen.io/NKiD/pen/JRVZgv?editors=1010
                      */
                    const resultsArray = ko.utils.arrayFilter(self.places(), (item) => {
                         return item.title().toLowerCase().indexOf(filter.toLowerCase()) !== -1;
                         //return ko.utils.stringStartsWith(item.title().toLowerCase(), filter);
                        });
                    resultsArray.forEach(function(matches){
                        matches.marker.setVisible(true);
                    });
                    /* If resultsArray is empty, return null
                     * returning "null" is used to trigger KO 'ifnot' databind and make "No Matches" text visible in the view.
                     * http://knockoutjs.com/documentation/ifnot-binding.html
                     * http://knockoutjs.com/documentation/visible-binding.html
                     */
                    if(resultsArray.length === 0){
                        return null;
                    }
                    self.currentPlace(resultsArray[0]);
                    return resultsArray;
                }
            });




        /** Google Maps API-------------------------------------- */
        // Create a styles array to use with the map.
        const styles = [
            {
              featureType: 'water',
              stylers: [
                { color: '#19a0d8' }
              ]
            },{
              featureType: 'administrative',
              elementType: 'labels.text.stroke',
              stylers: [
                { color: '#ffffff' },
                { weight: 6 }
              ]
            },{
              featureType: 'administrative',
              elementType: 'labels.text.fill',
              stylers: [
                { color: '#e85113' }
              ]
            },{
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [
                { color: '#efe9e4' },
                { lightness: -40 }
              ]
            },{
              featureType: 'transit.station',
              stylers: [
                { weight: 9 },
                { hue: '#e85113' }
              ]
            },{
              featureType: 'road.highway',
              elementType: 'labels.icon',
              stylers: [
                { visibility: 'off' }
              ]
            },{
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [
                { lightness: 100 }
              ]
            },{
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [
                { lightness: -100 }
              ]
            },{
              featureType: 'poi',
              elementType: 'geometry',
              stylers: [
                { visibility: 'on' },
                { color: '#f0e4d3' }
              ]
            },{
              featureType: 'road.highway',
              elementType: 'geometry.fill',
              stylers: [
                { color: '#efe9e4' },
                { lightness: -25 }
              ]
            }
          ];

        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 41.9028, lng: 12.4964},
          zoom: 14,
          styles: styles,
          mapTypeControl: false
        });

        const largeInfowindow = new google.maps.InfoWindow();

        const bounds = new google.maps.LatLngBounds();

        /** display all markers from markers array, by default
          * Set clicks on markers to execute populateInfoWindow(), which opens info window
          */
        markers.forEach(function(marker){
            marker.setMap(map);
            bounds.extend(marker.position);
            marker.addListener('click', function(){
              /** Clear all active marker animation, so that there is only one marker animation at a time */
              self.clearAnimation();
              self.places().forEach(function(placeItem){
                if(marker.title == placeItem.title()){
                  self.populateInfoWindow(marker, largeInfowindow, placeItem);
                  /** Toggle marker animation to bounce/unbounce when it itself is clicked */
                  self.toggleAnimation(marker);
                }
              });
            });
            map.fitBounds(bounds);
        });

        /** Function that toggles marker animation when executed
          * Modeled from example at
          * https://developers.google.com/maps/documentation/javascript/examples/marker-animations
          */
        this.toggleAnimation = function(marker){
          if (marker.getAnimation() !== null){
            marker.setAnimation(null);
          } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
          }
        };

        /** Function that clears all marker animations and is used prior to the execution of toggleAnimation,
          * so that only one marker is animated at a time.
          */
        this.clearAnimation = function(){
          markers.forEach(function(marker){
            marker.setAnimation(null);
          });
        };

        /** Populates the infowindow when the marker is clicked. Allows
          * one infowindow which will open at the marker that is clicked, and populate based
          * on that markers position.
          */
        this.populateInfoWindow = function(marker, infowindow, foursquaredata) {
            if (infowindow.marker != marker) {
                infowindow.setContent('');
                infowindow.marker = marker;
                infowindow.addListener('closeclick', function() {
                    infowindow.marker = null;
                });
                const streetViewService = new google.maps.StreetViewService();
                const radius = 50;
                /** In case the status is OK, which means the pano was found, compute the
                  * position of the streetview image, then calculate the heading, then get a
                  * panorama from that and set the options
                  */
                var getStreetView = function(data, status) {
                    if (status == google.maps.StreetViewStatus.OK) {
                        const nearStreetViewLocation = data.location.latLng;
                        const heading = google.maps.geometry.spherical.computeHeading(
                        nearStreetViewLocation, marker.position);
                        infowindow.setContent('<div><h1><b>' + marker.title +'</b></h1></div><div> <h4>Foursquare Checkins: </h4> <b id="foursquare-checkin-data">'+ foursquaredata.checkins +'</b></div><div><h4>Address: </h4><b id="foursquare-address-data">'+foursquaredata.address+'</b></div><div id="pano"></div>');
                        const panoramaOptions = {
                            position: nearStreetViewLocation,
                            pov: {
                                heading: heading,
                                pitch: 30
                            }
                        };
                        const panorama = new google.maps.StreetViewPanorama(
                            document.getElementById('pano'), panoramaOptions);
                    } else {
                        infowindow.setContent('<div>' + marker.title + '</div>' +
                        '<div>No Street View Found</div>');
                    }
                };
                streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
                // Open the infowindow on the correct marker.
                infowindow.open(map, marker);
            }
        };

        function makeMarkerIcon(markerColor) {
            const markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
            '|40|_|%E2%80%A2',
             new google.maps.Size(31, 44),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(31,44));
            return markerImage;
        }

        /* wired to mouseovers on place li elements, which results in changing the marker color. */
        this.setPlaceMouseOver = function(clickedPlace){
            self.currentPlace(clickedPlace);
            for (let i = 0; i < markers.length; i++){
                if (clickedPlace.title() == markers[i].title){
                    markers[i].setIcon(makeMarkerIcon('FFB99B'));
                }
            }
        };

        /* wired to mouseouts on li elements, returning the marker color to the default color. */
        this.setPlaceMouseOut = function(clickedPlace){
            for (let i =0; i < markers.length; i++){
                if (clickedPlace.title() == markers[i].title){
                    markers[i].setIcon(makeMarkerIcon('90A1B7'));
                }
            }

        };

        /** This function matches the li place item to the matching marker and then opens the info window for the designated marker
         *  This is wired to clicks on individiual location li elements
         */
        this.setPlace = function(clickedPlace){
            for (let i = 0; i < markers.length; i++){
                /** Sets all marker animations to null to setup only one marker animation at a time */
                markers[i].setAnimation(null);
                if (clickedPlace.title() == markers[i].title){
                    map.panTo(markers[i].position);
                    self.populateInfoWindow(markers[i], largeInfowindow, clickedPlace);
                    /** toggle marker animation to bounce/unbounce when list item is clicked */
                    self.toggleAnimation(markers[i]);
                }
            }

        };

        /** This function toggles list view to become visible or not visible by setting ko observable to true or false.
          * It is then wired to the app h1 header: "Best Gelato In Rome" and executed when user clicks it.
          */
        this.toggleListView = function(){
            if(self.toggleState() === true){
                self.toggleState(false);
            } else {
                self.toggleState(true);
            }
        };


    };
    ko.applyBindings(new locationsViewModel());
  }).fail(function(){
    /** Alert message to the user if app fails to grab data from json source
      * https://stackoverflow.com/questions/1740218/error-handling-in-getjson-calls
      */
    alert('Could not retrieve initial location data, please try again.');
  });
}
