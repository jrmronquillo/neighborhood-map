# Udacity Neighborhood Project - Jerome Ronquillo
___
This project is a single page application that features a map of Rome with the following features:
* Map Markers for to identify 5 locations where the Best Gelato can be found
* Search Function that filters the locations list after each key stroke
* Use of Google Streetview api to display streetview of location in each marker info window
* Use of foursquare api to display additional information such as checkins and addresses for each location
* Mouseovers on items in the list view will highlight the matching marker in the map and display additional location details in list view
* Clicking items in the list view will open the info window on the matching marker in the map
* Application is responsive, on smaller viewports, the list view moves to the bottom and clicking the hamburger icon will toggle open/close the list view.


# Usage
___
1. Download Repository to local machine
2. Note: If you use the Chrome browser and attempt to launch the app directly by double clicking the index.html, it will result in the app failing to load any data. This is because the app uses ajax to grab data from a local json file which violates the CORS policy for the Chrome browser.
3. To get around this, use a local webserver. For MAC users, instructions can be found here: "https://lifehacker.com/start-a-simple-web-server-from-any-directory-on-your-ma-496425450"
    *Open terminal
    *change directory to downloaded repository "cd /Desktop/GelatoApp"
    *"python -m SimpleHTTPServer"
    *Open Chrome browser and use "localhost:8000" as the url
4. If there is an error with getting json data, an alert message will be displayed to the user
5. Otherwise, observe App open in browser
6. On larger viewports such as Desktop PC's or MAC's, location list will appear on the left of the map
7. On smaller viewports such as mobile devices, location list will appear on the bottom of the map.
8. In any device, click the 'hamburger' (navigation) icon to toggle the list view closed or open and 5 locations will appear by default
9. Typing letters into the searchbox will automatically filter the list to return closest matching location titles
10. Mouseover on location titles in the list view will highlight the matching map marker
11. Clicking on location titles in the list view will activate marker animation and open an info window with additional details on the corresponding map marker
12. Errors with the Google API requests will display an error message in the map area of the app to the user
13. Errors with the Foursquare API requests will display an error message in the foursquare data areas of the app to the user.

# Latest Updates:
___
* JSON data was separated into its own file
* Search filter modified to be more dynamic by changing logic from ‘stringStartsWith’ to ‘indexOf’
* Marker animations added when there are clicks on the marker as well as clicks to list items
* Logic removed that was using manual DOM manipulation to attempt to display error messages in the infoWindow
* Semantic tags added in the index.html to indicate structure of HTML document
* Indent tool used to make sure index.html indentation was consistent
* Unnecessary test files removed

# Resources
___
* Udacity's The Frontend: Javascript & AJAX course.
* javascript onerror event (to handle Google maps error) - https://www.w3schools.com/jsref/event_onerror.asp
* Knockout Framework (observables and data-binds) - http://knockoutjs.com/documentation
* Knockout Utility: stringStartsWith - http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
* Google Maps Javascript API - https://developers.google.com/maps/documentation/javascript/
* Foursquare API - https://developer.foursquare.com/docs/api/getting-started
* KnockoutJS value toggle  - https://stackoverflow.com/questions/14867906/knockoutjs-value-toggling-in-data-bind
* Filtering with indexOf - https://codepen.io/NKiD/pen/JRVZgv?editors=1010
* getJson error handling - https://stackoverflow.com/questions/1740218/error-handling-in-getjson-calls# neighborhood-map
