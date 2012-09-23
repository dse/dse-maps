/*jslint devel: true, browser: true, vars: true, white: true, sloppy: true */
/*global google, jQuery */

var maps_api_key = "AIzaSyDORq7-X81z4tMI8GnQrzBQKzHZVyvpBMo";
var project_id   = "dse-project-1";
var Cookies = (function () {
	"use strict";
	var self = {
		init: function () {
			console.log("moo");
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
			console.log(name, value);
			document.cookie = name + "=" + encodeURIComponent(value) + "; max-age=31536000";
			document.cookie = name + "=" + encodeURIComponent(value);
			this.cookies[name] = value;
			console.log(document.cookie);
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
	console.log(self.cookies);
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
		$("#locate_me_button").click(locate_me);
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
		
	}
	$(function () {
		initialize();
	});
}(jQuery));

