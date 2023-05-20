const events_uri = "https://images.parkrun.com/events.json";

let map;
var events = {};
var countries = {};
var num_events = {
	1: 0,
	2: 0
};
var num_completed = {
	1: 0,
	2: 0
};

// seriesid:
// 0 - completed events
// 1 - parkrun events (from https://images.parkrun.com/events.json)
// 2 - junior events (from https://images.parkrun.com/events.json)
function set_view_mask(seriesid) {
	if (map.getLayer("events_layer")) map.removeLayer("events_layer");
	map.addLayer({
		"id": "events_layer",
		"type": "circle",
		"source": "events_source",
		"paint": {
			"circle-color": "#ffffff",
			"circle-radius": 4,
			"circle-stroke-color": "#000000",
			"circle-stroke-width": 1,
		},
		"filter": ["==", "seriesid", seriesid]
	});

	if (map.getLayer("completed_layer")) map.removeLayer("completed_layer");
	var completed_layer = {
		"id": "completed_layer",
		"type": "circle",
		"source": "completed_source",
		"paint": {
			"circle-color": "#ffa300",
			"circle-radius": 4,
			"circle-stroke-color": "#000000",
			"circle-stroke-width": 2,
		}
	};

	function show_popup(e) {
		let popup = new maplibregl.Popup();
		popup.setLngLat(e.features[0].geometry.coordinates.slice());
		const props = e.features[0].properties;
		var html = "<a href=\"https://"+countries[props.countrycode].url+"/"+props.eventname+"\"><b>"+props.EventLongName+"</b></a><br>"+props.EventLocation;
		if (props.completed) {
			html += "<hr><table style=\"width: 100%\"><tr><td>times completed</td><td style=\"float: right;\">"+props.number_completions+"</td></tr><tr><td>best time</td><td style=\"float: right;\">"+props.best_time+"</td></tr><tr><td>best position</td><td style=\"float: right;\">"+props.best_overall_pos+"</td></tr><tr><td>best gender position</td><td style=\"float: right;\">"+props.best_gender_pos+"</td></tr></table>"
		}
		popup.setHTML(html);
		popup.addTo(map);
	}

	if (seriesid == 0) {
		map.on("click", "completed_layer", show_popup);
	} else {
		completed_layer.filter = ["==", "seriesid", seriesid];
		map.on("click", "events_layer", show_popup);
	}

	map.addLayer(completed_layer);

	const current_active = document.querySelector(".parkmapper_current_mask");
	if (current_active != null) current_active.classList.remove("parkmapper_current_mask");
	document.getElementById("parkmapper_mask_"+seriesid.toString()).classList.add("parkmapper_current_mask");
}

const map_container_node = document.createElement("div");
map_container_node.id = "parkmapper_map_container";
document.body.appendChild(map_container_node);
map_container_node.innerHTML = "<nav id=\"parkmapper_topbar\"><div id=\"parkmapper_left\"><ul><li><b>"+document.querySelector("h2").innerHTML.split("&nbsp;")[0]+"</b></li><li><a href=\"javascript:set_view_mask(1)\" class=\"parkmapper_mask\" id=\"parkmapper_mask_1\">parkrun</a></li><li><a href=\"javascript:set_view_mask(2)\" class=\"parkmapper_mask\" id=\"parkmapper_mask_2\">junior</a></li><li><a href=\"javascript:set_view_mask(0)\" class=\"parkmapper_mask\" id=\"parkmapper_mask_0\">completed</a></li></ul></div><div id=\"parkmapper_right\"><ul><li><a href=\"javascript:hide_map()\"><b>X</b></a></li></ul></div></nav><div id=\"parkmapper_map\"></div>"

function show_map() {
	map_container_node.style.display = "block";
	window.dispatchEvent(new Event("resize")); // needed to make map take up full size
	document.body.style.overflow = "hidden";
}

function hide_map() {
	map_container_node.style.display = "none";
	document.body.style.overflow = "initial";
}

map = new maplibregl.Map({
	"container": "parkmapper_map",
	"style": "https://demotiles.maplibre.org/style.json",
	"center": [0, 54],
	"zoom": 4
});

map.on("load", function() {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (this.status == 200 && this.readyState == 4) {
			var json = JSON.parse(request.responseText);
			json.events.features.forEach((feature) => {
				var event_data = {
					coordinates: feature.geometry.coordinates,
					properties: feature.properties
				};
				events[feature.properties.eventname] = event_data;
				num_events[feature.properties.seriesid]++;
			});
			countries = json.countries;

			map.addSource("events_source", {
				"type": "geojson",
				"data": json.events
			});

			let completed = [];
			const page = window.location.href.slice(27).replace(/index.html\/$/, "");
			if (page.startsWith("parkrunner")) {
				// summary stats
				const events_table_rows = document.getElementById("event-summary").nextSibling.children[1].children;
				for (let i = 0; i < events_table_rows.length; i++) {
					const name = events_table_rows[i].children[0].children[0].href.split("/")[3];
					if (events[name] == null) {
						console.error("unable to find "+events_table_rows[i].children[0].children[0].innerText+" in "+events_uri+". This probably means this event no longer exists... sorry :(");
					} else {
						completed.push({
							"type": "Feature",
							"properties": events[name].properties,
							"geometry": {
								"type": "Point",
								"coordinates": events[name].coordinates
							}
						});
						events[name].properties.completed = true;
						events[name].properties.number_completions = events_table_rows[i].children[1].innerText;
						events[name].properties.best_gender_pos = events_table_rows[i].children[2].innerText;
						events[name].properties.best_overall_pos = events_table_rows[i].children[3].innerText;
						events[name].properties.best_time = events_table_rows[i].children[4].children[0].innerText;
						num_completed[events[name].properties.seriesid]++;
					}
				}
				map.addSource("completed_source", {
					"type": "geojson",
					"data": {
						"type": "FeatureCollection",
						"features": completed
					}
				});

				set_view_mask(0);

				document.getElementById("parkmapper_mask_1").innerText += " ("+num_completed[1].toString()+"/"+num_events[1].toString()+")";
				document.getElementById("parkmapper_mask_2").innerText += " ("+num_completed[2].toString()+"/"+num_events[2].toString()+")";
				document.getElementById("parkmapper_mask_0").innerText += " ("+(num_completed[1]+num_completed[2]).toString()+")";

				const toggle_all_node = document.querySelector("#content > p > a");
				const parent_node = toggle_all_node.parentNode;
				const show_map_node = document.createElement("a");
				show_map_node.innerText = "View this parkrunner's runs on a map";
				show_map_node.href = "javascript:show_map()";
				show_map_node.style.margin_left = 50;
				parent_node.insertBefore(show_map_node, toggle_all_node.nextSibling);
				parent_node.insertBefore(document.createElement("br"), show_map_node);
			}
		}
	}
	request.open("GET", events_uri, true);
	request.send();
})
