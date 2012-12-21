/*jslint devel: true, browser: true, vars: true, white: true, sloppy: true */
/*global google, jQuery */

var maps_api_key = "AIzaSyDORq7-X81z4tMI8GnQrzBQKzHZVyvpBMo";
var project_id   = "dse-project-1";
var Cookies = (function () {
	"use strict";
	var self = {
		init: function () {
			var all, list;
			this.cookies = {};
			all = document.cookie;
			if (all === "") { return; }
			list = all.split("; ");
			list.forEach(function (cookie) {
				var p, name, value;
				p = cookie.indexOf("=");
				name = cookie.substring(0, p);
				value = cookie.substring(p + 1);
				value = decodeURIComponent(value);
				this.cookies[name] = value;
			}, this);
		},
		set: function (name, value) {
			document.cookie = name + "=" + encodeURIComponent(value) + "; max-age=31536000";
			document.cookie = name + "=" + encodeURIComponent(value);
			this.cookies[name] = value;
		},
		"delete": function (name) {
			document.cookie = name + "=; max-age=0";
			delete this.cookies[name];
		},
		get: function (name) {
			return this.cookies[name];
		}
	};
	self.init();
	return self;
}());

function $ID(id) {
	return document.getElementById(id);
}

(function ($) {
	var defaults = {
		"latitude"  : 0,
		"longitude" : 0,
		"zoom"      : 3,
		"mapType"   : google.maps.MapTypeId.ROADMAP
	};
	function initialize() {
		"use strict";
		
		var latitude  = Cookies.get("lat");
		var longitude = Cookies.get("lng");
		var zoom      = Cookies.get("zoom");
		var mapType   = Cookies.get("mapType");

		latitude  = latitude  ? parseFloat(latitude)  : defaults.latitude;
		longitude = longitude ? parseFloat(longitude) : defaults.longitude;
		zoom      = zoom      ? parseInt(zoom, 10)    : defaults.zoom;
		mapType   = mapType   ? parseInt(mapType, 10) : google.maps.MapTypeId.ROADMAP;

		var map_options = {
			"center"    : new google.maps.LatLng(latitude, longitude),
			"zoom"      : zoom,
			"mapTypeId" : mapType,
			"mapTypeControlOptions": {
				"mapTypeIds": [
					google.maps.MapTypeId.ROADMAP,
					google.maps.MapTypeId.HYBRID,
					google.maps.MapTypeId.SATELLITE,
					google.maps.MapTypeId.TERRAIN
				]
			},
			"panControl": false,
			"zoomControl": false,
			"rotateControl": true, // eh?
			"scaleControl": true
		};

		var map_canvas = $ID("map_canvas");
		var map = new google.maps.Map(map_canvas, map_options);

		var update = function() {
			...
		};
		google.maps.event.addListener(map, "center_changed", update);
		google.maps.event.addListener(map, "zoom_changed", update);
		
		function locate_me() {
			navigator.geolocation.getCurrentPosition(
				function (position) {
					var latitude = position.coords.latitude;
					var longitude = position.coords.longitude;
					map.panTo(new google.maps.LatLng(latitude, longitude));
					if (map.getZoom() < 8) {
						map.setZoom(8);
					}
				},
				function () {
					alert("I can't find you; sorry.");
				}
			);
			return false;
		}

		$("#locate_me_button").click(function() {
			console.log("locate");
			locate_me();
			return false;
		});

		$("#mapmaker_checkbox").change(function () {
			map.setOptions({ "mapMaker": this.checked });
			return false;
		}).trigger("change");

		function update_cookies() {
			var center = map.getCenter();
			Cookies.set("lat", center.lat());
			Cookies.set("lng", center.lng());
			var zoom = map.getZoom();
			Cookies.set("zoom", zoom);
		};
		google.maps.event.addListener(map, "center_changed", update_cookies);
		google.maps.event.addListener(map, "zoom_changed", update_cookies);

		$("form#places input[name='query']").focus();

		var places;
		$("form#places").submit(function () {
			var form = this;
			console.log("onsubmit");
			if (!places) {
				places = new google.maps.places.PlacesService(map);
				console.log("places");
			}
			var request = {
				bounds: map.getBounds(),
				query: form.query.value
			};
			var callback = function(results, status) {
				console.log("callback");
				switch (status) {
				case google.maps.places.PlacesServiceStatus.OK:
					alert(results.length + " result(s) found.");
					break;
				case google.maps.places.PlacesServiceStatus.ERROR:
					alert("Problem contacting Google's servers.");
					break;
				case google.maps.places.PlacesServiceStatus.INVALID_REQUEST:
					alert("Invalid request.");
					break;
				case google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT:
					alert("You've done too many queries, sorry.");
					break;
				case google.maps.places.PlacesServiceStatus.REQUEST_DENIED:
					alert("Your web page is not allowed to use the Places service.");
					break;
				case google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR:
					alert("Can't do a search because of a server error.");
					break;
				case google.maps.places.PlacesServiceStatus.ZERO_RESULTS:
					alert("No results found.");
					break;
				default:
					alert("A *really* unknown error!");
					break;
				}
			};
			places.textSearch(request, callback);
			return false;
		});
		
	}
	$(function () {
		initialize();
	});
}(jQuery));

