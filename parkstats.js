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

	const current_active = document.querySelector(".parkstats_current_mask");
	if (current_active != null) current_active.classList.remove("parkstats_current_mask");
	document.getElementById("parkstats_mask_"+seriesid.toString()).classList.add("parkstats_current_mask");
}

const map_container_node = document.createElement("div");
map_container_node.id = "parkstats_map_container";
document.body.appendChild(map_container_node);
map_container_node.innerHTML = "<nav id=\"parkstats_topbar\"><div id=\"parkstats_left\"><ul><li><b>"+document.querySelector("h2").innerHTML.split("&nbsp;")[0]+"</b></li><li><a href=\"javascript:set_view_mask(1)\" class=\"parkstats_mask\" id=\"parkstats_mask_1\">parkrun</a></li><li><a href=\"javascript:set_view_mask(2)\" class=\"parkstats_mask\" id=\"parkstats_mask_2\">junior</a></li><li><a href=\"javascript:set_view_mask(0)\" class=\"parkstats_mask\" id=\"parkstats_mask_0\">completed</a></li></ul></div><div id=\"parkstats_right\"><ul><li><a href=\"javascript:hide_map()\"><b>X</b></a></li></ul></div></nav><div id=\"parkstats_map\"></div>"

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
	"container": "parkstats_map",
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
			if (page.endsWith("all/")) {
				var bingo_times = new Array(60);
				var bingo_times_completed = 0;
				var events_table_rows;
				const results_tables = document.querySelectorAll("table#results");
				for (i in results_tables) {
					console.log(results_tables[i].querySelector("caption").innerText);
					if (results_tables[i].querySelector("caption").innerText == "All Results") {
						events_table_rows = results_tables[i].querySelector("tbody").children;
						break;
					}
				};
				//const events_table_rows = document.getElementById("content").children[10].children[0].children[2].children;
				if (events_table_rows.length == 0) return;
				for (let i = 0; i < events_table_rows.length; i++) {
					const date = events_table_rows[i].children[1].children[0].innerText;
					const name = events_table_rows[i].children[0].children[0].innerText;
					const time = events_table_rows[i].children[4].innerText;
					const url = events_table_rows[i].children[0].children[0].href;

					const seconds = parseInt(time.slice(time.length-2));
					if (bingo_times[seconds] == null) bingo_times[seconds] = [];
					bingo_times[seconds].push({
						"name": name,
						"date": date,
						"time": time,
						"url": url
					});
				}

				const bingo_div = document.createElement("div");
				document.getElementById("content").insertBefore(bingo_div, document.getElementById("comments"));

				const bingo_table_outer = document.createElement("table");
				bingo_table_outer.id = "results";
				bingo_div.appendChild(bingo_table_outer);

				const bingo_caption = document.createElement("caption");
				bingo_caption.innerText = "Bingo";
				bingo_table_outer.appendChild(bingo_caption);

				const bingo_progress = document.createElement("p");
				bingo_progress.id = "parkstats_bingo_progress";
				bingo_caption.appendChild(bingo_progress);

				const bingo_table = document.createElement("tbody");
				bingo_table_outer.appendChild(bingo_table);

				const num_bingo_columns = 10;
				for (let i = 0; i < 60/num_bingo_columns; i++) {
					const bingo_table_row = document.createElement("tr");
					bingo_table_row.classList.add(i % 2 == 0 ? "even" : "odd");
					for (let j = 0; j < num_bingo_columns; j++) {
						const bingo_table_cell = document.createElement("td");
						bingo_table_cell.classList.add("parkstats_bingo_cell");
						const num = (num_bingo_columns*i+j);
						if (bingo_times[num] == null) {
							bingo_table_cell.innerHTML = "<b>__:__:"+(num < 10 ? "0" : "")+num.toString()+"</b>";
						} else {
							const timestr = "00:00:00".slice(0, 8-bingo_times[num][0].time.length)+bingo_times[num][0].time;
							bingo_table_cell.innerHTML = "<b>"+timestr+"</b><br>at <a href=\""+bingo_times[num][0].url+"\">"+bingo_times[num][0].name+"</a> on "+bingo_times[num][0].date;
							const num_times_for_time = bingo_times[num].length; // heheh what a stupid name
							if (num_times_for_time != 1) {
								bingo_table_cell.innerHTML += "<br>(<div class=\"parkstats_popup\"><a href=\"javascript:void(0)\" onclick=\"event.target.parentElement.classList.add('parkstats_show')\">"+(bingo_times[num].length-1).toString()+" more</a></div>)";
								const bingo_cell_popup = document.createElement("div");
								bingo_cell_popup.classList.add("parkstats_popup_content");
								bingo_cell_popup.innerHTML = "<b>"+(num_times_for_time-1).toString()+" more time"+(num_times_for_time == 2 ? "" : "s")+"</b>"
								for (let k = 1; k < bingo_times[num].length; k++) {
									bingo_cell_popup.innerHTML += "<br>"+bingo_times[num][k].time+" at <a href=\""+bingo_times[num][k].url+"\">"+bingo_times[num][k].name+"</a> on "+bingo_times[num][k].date;
								}
								bingo_table_cell.querySelector(".parkstats_popup").appendChild(bingo_cell_popup);
							}
							bingo_times_completed++;
						}
						bingo_table_row.appendChild(bingo_table_cell);
					}
					bingo_table.appendChild(bingo_table_row);
				}

				document.addEventListener("mouseup", function(e) {
					var visible_popups = document.getElementsByClassName("parkstats_show");
					for (let i = 0; i < visible_popups.length; i++) {
						if (!visible_popups[i].contains(e.target)) {
							visible_popups[i].classList.remove("parkstats_show");
						}
					}
				});

				if (bingo_times_completed == 60) {
					bingo_progress.innerText = "BINGO!!! Congrats to this parkrunner for completing parkrun bingo \\(^O^)/";
				} else {
					bingo_progress.innerText = "this parkrunner has completed "+bingo_times_completed.toString()+"/60 of parkrun bingo - only "+(60-bingo_times_completed).toString()+" to go!";
				}
			} else if (page.startsWith("parkrunner")) {
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

				document.getElementById("parkstats_mask_1").innerText += " ("+num_completed[1].toString()+"/"+num_events[1].toString()+")";
				document.getElementById("parkstats_mask_2").innerText += " ("+num_completed[2].toString()+"/"+num_events[2].toString()+")";
				document.getElementById("parkstats_mask_0").innerText += " ("+(num_completed[1]+num_completed[2]).toString()+")";

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
