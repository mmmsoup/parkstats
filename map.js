if (typeof(browser) === "undefined") {
	var browser = chrome;
}

let map;
let params;
let runner_name;
let completed;
let countrycodes;

// uncompleted parkruns, completed parkruns, uncompleted juniors, completed juniors
var panes = new Array(4);

const log_div = document.createElement("div");
// severity: "message", "warning", or "error"
function log(message, severity) {
	const container = document.createElement("div");
	container.classList.add("logitem");
	container.classList.add(severity == null ? "message" : severity);
	container.innerText = message;
	log_div.appendChild(container);
}

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

var parkstats_control = L.Control.extend({        
	options: {
		position: "topleft"
	},
	
	onAdd: function (map) {
		const container = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
		container.id = "pane_toggle"
		container.style.background = "#ffffff";
		container.style.border = "2px solid rgba(0,0,0,0.2)";
		container.style.padding = "10px";

		// panes and stuff
		const panes_section = L.DomUtil.create("div", "section", container);
		panes_section.style.textAlign = "center";

		const panes_title = L.DomUtil.create("b", "", L.DomUtil.create("p", "heading", panes_section));
		panes_title.innerText = runner_name;
		
		const panes_form = L.DomUtil.create("form", "", panes_section);
		panes_form.style.display = "inline-block";

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
			const element = L.DomUtil.create("input", "", form);
			element.type = "radio";
			element.name = "pane";

			element.addEventListener("change", function(e) {
				if (e.target.value == "on") {
					visible_layers = mask;
					toggle_layers();
				}
			});

			const label = L.DomUtil.create("label", "", form);
			label.for = element.id;
			label.innerText = text;

			return element;
		}

		const radio_parkrun = create_radio(panes_form, PARKRUN_LAYER, get_localised_string("map_mask_parkrun"));
		const radio_junior = create_radio(panes_form, JUNIOR_LAYER, get_localised_string("map_mask_junior"));
		const radio_all = create_radio(panes_form, PARKRUN_LAYER | JUNIOR_LAYER, get_localised_string("map_mask_all"));

		L.DomUtil.create("br", "", panes_form);

		const checkbox_completed = L.DomUtil.create("input", "", panes_form);
		checkbox_completed.type = "checkbox";
		checkbox_completed.id = "checkbox_completed";

		checkbox_completed.addEventListener("change", function(e) {
			only_completed_visible = e.target.checked;
			toggle_layers();
		});
		
		const label = L.DomUtil.create("label", "", panes_form);
		label.for = "checkbox_completed";
		label.innerText = get_localised_string("map_mask_completed");

		radio_parkrun.checked = true;
		checkbox_completed.checked = true;
		toggle_layers();

		// technical info etc...
		function toggle_collapsed() {
			this.classList.toggle("collapsed");
		}

		const technical_section = L.DomUtil.create("div", "section", container);

		const technical_title = L.DomUtil.create("p", "heading", technical_section);
		technical_title.style.textAlign = "center";
		technical_title.classList.add("collapsible", "collapsed");
		technical_title.onclick = toggle_collapsed;
		const technical_title_text = L.DomUtil.create("b", "", technical_title);
		technical_title_text.innerText = " "+get_localised_string("technical_details");

		const technical_container = L.DomUtil.create("div", "", technical_section);

		const log_container = L.DomUtil.create("div", "log", technical_container);
		const log_title = L.DomUtil.create("b", "collapsible", log_container);
		log_title.innerText = "log";
		log_title.onclick = toggle_collapsed;
		log_container.appendChild(log_div);

		const request = new XMLHttpRequest();
		request.responseType = "json";
		request.onload = function() {
			if (this.status == 200) {
				const start_collapsed = true;
				function parse_dict(dict, parent) {
					for (const [key, value] of Object.entries(dict)) {
						const el = L.DomUtil.create("div", "", parent);
						const key_el = L.DomUtil.create("b", start_collapsed ? "collapsed" : "", el);
						key_el.innerText = key;
						if (typeof(value) === "object") {
							key_el.classList.add("collapsible");
							key_el.onclick = toggle_collapsed;
							const next = L.DomUtil.create("div", "", el);
							next.style.paddingLeft = "10px";
							parse_dict(value, next);
						} else {
							const val_el = L.DomUtil.create("span", "technical_info_val", el);
							val_el.innerText = value.toString();
						}
					}
				}
				parse_dict({"build.json": this.response}, L.DomUtil.create("div", "build_info", technical_container));
			}
		}
		request.open("GET", browser.runtime.getURL("build.json"));
		request.send();
		
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
						log("unable to find event data for '"+completed_event[0]+"' - it likely no longer exists :(", "warning");
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

				map.addControl(new parkstats_control());

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
	runner_name = atob(params.get("name"));

	document.querySelector("html").lang = params.get("lang");
	set_language(params.get("lang"));
	document.title = "Parkstats — "+runner_name

	map = L.map("map", {
		center: [51, 0],
		zoom: 3,
		zoomControl: false
	});

	map.addControl(L.control.zoom({position: "bottomleft"}));

	map.attributionControl.addAttribution("<a href=\"https://www.parkrun.com\">Parkrun</a>");

	load_baselayer().then(load_countrycodes).then(load_events);
}
