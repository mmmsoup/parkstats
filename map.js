if (typeof(browser) === "undefined") {
	var browser = chrome;
}

let map;
let params;
let completed;
let countrycodes;

// uncompleted parkruns, completed parkruns, uncompleted juniors, completed juniors
var panes = new Array(4);

function show_map_popup(e) {
	let popup = new maplibregl.Popup();
	popup.setLngLat(e.features[0].geometry.coordinates.slice());
	const props = e.features[0].properties;
	var html = "<a href=\"https://"+countries[props.countrycode].url+"/"+props.eventname+"\"><b>"+props.EventLongName+"</b></a><br>"+props.EventLocation;
	if (props.completed) {
		html += "<hr><table style=\"width: 100%\"><tr><td>"+get_localised_string("times_completed")+"</td><td style=\"float: right;\">"+props.number_completions+"</td></tr><tr><td>"+get_localised_string("best_time")+"</td><td style=\"float: right;\">"+props.best_time+"</td></tr><tr><td>"+get_localised_string("best_position")+"</td><td style=\"float: right;\">"+props.best_overall_pos+"</td></tr><tr><td>"+get_localised_string("best_gender_position")+"</td><td style=\"float: right;\">"+props.best_gender_pos+"</td></tr></table>"
	}
	popup.setHTML(html);
	popup.addTo(map);
}

var pane_toggle = L.Control.extend({        
	options: {
		position: "topleft"
	},
	
	onAdd: function (map) {
		var container = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
		container.id = "pane_toggle"
		container.style.background = "#ffffff";
		container.style.border = "2px solid rgba(0,0,0,0.2)";
		container.style.padding = "10px";

		var title = L.DomUtil.create("p", "", container);
		const title_text = document.createElement("b");
		title_text.innerText = atob(params.get("name"));
		title.appendChild(title_text);
		title.style.textAlign = "center";
		
		var form = L.DomUtil.create("form", "", container);

		const PARKRUN_LAYER	= 1;
		const JUNIOR_LAYER	= 2;

		var visible_layers = PARKRUN_LAYER;
		var only_completed_visible = true;

		function toggle_layers() {
			// yes i hate this too
			for (var i = 0; i < panes.length; i++) {
				if (visible_layers & PARKRUN_LAYER) {
					panes[i].style.display = (i == 1) || (!only_completed_visible && i == 0) ? "initial" : "none";
				} else if (visible_layers & JUNIOR_LAYER) {
					panes[i].style.display = (i == 3) || (!only_completed_visible && i == 2) ? "initial" : "none";
				} else if (visible_layers & PARKRUN_LAYER && visible_layers & JUNIOR_LAYER) {
					panes[i].style.display = (i % 2) || !only_completed_visible ? "initial" : "none";
				}
			}
		}

		function create_radio(form, mask, text) {
			var element = L.DomUtil.create("input", "", form);
			element.type = "radio";
			element.name = "pane";

			element.addEventListener("change", function(e) {
				if (e.target.value == "on") {
					visible_layers = mask;
					toggle_layers();
				}
			});

			var label = L.DomUtil.create("label", "", form);
			label.for = element.id;
			label.innerText = text;

			return element;
		}

		var radio_parkrun = create_radio(form, PARKRUN_LAYER, get_localised_string("map_mask_parkrun"));
		var radio_junior = create_radio(form, JUNIOR_LAYER, get_localised_string("map_mask_junior"));
		var radio_all = create_radio(form, PARKRUN_LAYER | JUNIOR_LAYER, get_localised_string("map_mask_all"));

		L.DomUtil.create("br", "", form);

		var checkbox_completed = L.DomUtil.create("input", "", form);
		checkbox_completed.type = "checkbox";
		checkbox_completed.id = "checkbox_completed";

		checkbox_completed.addEventListener("change", function(e) {
			only_completed_visible = e.target.checked;
			toggle_layers();
		});
		
		var label = L.DomUtil.create("label", "", form);
		label.for = "checkbox_completed";
		label.innerText = get_localised_string("map_mask_completed");

		radio_parkrun.checked = true;
		checkbox_completed.checked = true;
		toggle_layers();

		return container;
	}
});

function load_baselayer() {
	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();
		request.onload = function() {
			if (this.status == 200) {
				L.geoJSON(this.response, {
					style: {
						color: "#888888",
						fill: true,
						fillColor: "#eeeeee",
						fillOpacity: 1
					}
				}).addTo(map);
				resolve();
			} else {
				reject();
			}
		}
		request.responseType = "json";
		request.open("GET", browser.runtime.getURL("countries.geojson"));
		request.send();
	});
}

function load_countrycodes() {
	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();
		request.onload = function() {
			if (this.status == 200) {
				countrycodes = this.response;
				resolve();
			} else {
				reject();
			}
		}
		request.responseType = "json";
		request.open("GET", browser.runtime.getURL("countrycodes.json"));
		request.send();
	});
}

function load_events() {
	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();
		request.onload = function() {
			if (this.status == 200) {
				var events = {};
				Object.assign(events, this.response);

				completed.forEach((completed_event) => {
					var event_in_list = events[completed_event[0]];
					if (event_in_list == null) {
						console.log("unable to find data for event '"+completed_event[0]+"'; this is likely because either the event no longer exists or the database contained in the extension is out of date");
					} else {
						event_in_list.completed = completed_event;
					}
				});

				panes[0] = map.createPane("p");	
				panes[1] = map.createPane("pc");	
				panes[2] = map.createPane("j");	
				panes[3] = map.createPane("jc");	

				panes[0].style.zIndex = 402;
				panes[1].style.zIndex = 404;
				panes[2].style.zIndex = 401;
				panes[3].style.zIndex = 403;

				for (const [name, event_data] of Object.entries(events)) {
					L.circleMarker(event_data.coords, {
						color: event_data.completed == null ? "#444444" : "#444444",
						fillColor: event_data.completed == null ? "#eeeeee" : "#ffa300",
						fillOpacity: 1,
						pane: (event_data.junior ? "j" : "p") + (event_data.completed == null ? "" : "c"),
						radius: 4,
						weight: 2
					}).addTo(map).on("click", function(event) {

						var html = "<a href=\"https://"+countrycodes[event_data.countrycode]+"/"+name+"\"><b>"+event_data.longname+"</b></a><br>"+event_data.location;
						if (event_data.completed != null) {
							html += "<hr><table style=\"width: 100%\"><tr><td>"+get_localised_string("times_completed")+"</td><td style=\"float: right;\">"+event_data.completed[1]+"</td></tr><tr><td>"+get_localised_string("best_time")+"</td><td style=\"float: right;\">"+event_data.completed[4]+"</td></tr><tr><td>"+get_localised_string("best_position")+"</td><td style=\"float: right;\">"+event_data.completed[3]+"</td></tr><tr><td>"+get_localised_string("best_gender_position")+"</td><td style=\"float: right;\">"+event_data.completed[2]+"</td></tr></table>"
						}
						event.target.bindPopup(html).openPopup();
					});
				}

				map.addControl(L.control.zoom({position: "bottomleft"}));
				map.addControl(new pane_toggle());

				resolve();
			} else {
				reject();
			}
		}
		request.responseType = "json";
		request.open("GET", browser.runtime.getURL("events.json"));
		request.send();
	});
}

window.onload = function() {
	params = new URLSearchParams(window.location.search);
	completed = JSON.parse(atob(params.get("data")));

	document.querySelector("html").lang = params.get("lang");
	set_language(params.get("lang"));

	map = L.map("map", {
		center: [51, 0],
		zoom: 3,
		zoomControl: false
	});

	load_baselayer().then(load_countrycodes).then(load_events);
}
