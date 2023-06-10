if (typeof(browser) === "undefined") {
	var browser = chrome;
}

function bingo() {
	var bingo_times = new Array(60);
	var bingo_times_completed = 0;
	const events_table_rows = document.querySelectorAll("table#results")[2].querySelector("tbody").children;
	if (events_table_rows.length != 0) {
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
					const cell_text = document.createElement("b");
					cell_text.innerText = "__:__:"+(num < 10 ? "0" : "")+num.toString()
					bingo_table_cell.appendChild(cell_text);
				} else {
					const time_element = document.createElement("b");
					time_element.innerText = "00:00:00".slice(0, 8-bingo_times[num][0].time.length)+bingo_times[num][0].time;
					bingo_table_cell.appendChild(time_element);

					bingo_table_cell.appendChild(document.createElement("br"));

					const info_parts = get_localised_string("bingo_info").replace("{DATE}", bingo_times[num][0].date).split("{COURSE}");

					bingo_table_cell.appendChild(document.createTextNode(info_parts[0]));

					const info_course = document.createElement("a");
					info_course.innerText = bingo_times[num][0].name;
					info_course.href = bingo_times[num][0].url;
					bingo_table_cell.appendChild(info_course);

					bingo_table_cell.appendChild(document.createTextNode(info_parts[1]));

					const num_times_for_time = bingo_times[num].length; // heheh what a stupid name
					if (num_times_for_time != 1) {
						bingo_table_cell.appendChild(document.createElement("br"));
						bingo_table_cell.appendChild(document.createTextNode("("));

						const popup_container = document.createElement("div");
						popup_container.classList.add("parkstats_popup");
						bingo_table_cell.appendChild(popup_container);

						const popup_show_button = document.createElement("a");
						popup_show_button.href = "javascript:void(0)";
						popup_show_button.onclick = function(event) {
							//event.target.parentElement.classList.add("parkstats_show")
							popup_container.classList.add("parkstats_show")
						}
						popup_show_button.innerText = get_localised_string("bingo_more").replace("{NUMBER}", (num_times_for_time-1).toString());
						popup_container.appendChild(popup_show_button);

						bingo_table_cell.appendChild(document.createTextNode(")"));

						const popup = document.createElement("div");
						popup.classList.add("parkstats_popup_content");

						const popup_title = document.createElement("b");
						popup_title.innerText = get_localised_string("bingo_more").replace("{NUMBER}", (num_times_for_time-1).toString());
						popup.appendChild(popup_title);

						for (let k = 1; k < bingo_times[num].length; k++) {
							popup.appendChild(document.createElement("br"));

							const popup_info_parts = get_localised_string("bingo_info").replace("{DATE}", bingo_times[num][k].date).split("{COURSE}");
							
							popup.appendChild(document.createTextNode(bingo_times[num][k].time+" "+popup_info_parts[0]));

							const popup_info_course = document.createElement("a");
							popup_info_course.innerText = bingo_times[num][k].name;
							popup_info_course.href = bingo_times[num][k].url;
							popup.appendChild(popup_info_course);

							popup.appendChild(document.createTextNode(popup_info_parts[1]));
						}

						popup_container.appendChild(popup);
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
			bingo_progress.innerText = get_localised_string("bingo_completed");
		} else {
			bingo_progress.innerText = get_localised_string("bingo").replace("{PROGRESS}", bingo_times_completed.toString()+"/60").replace("{LEFT}", (60-bingo_times_completed).toString());
		}
	}
}

function main() {
	const domain = window.location.href.match(/(?<=parkrun\.)[^\/]+/)[0];
	const page = window.location.href.split(/parkrun\.[^\/]+/)[1]

	const lang = get_language_for_domain(domain);
	set_language(lang);

	if (page.endsWith("all/") || page.endsWith("5k/") || page.endsWith("juniors/")) {
		// bingo
		
		bingo();
	} else if (page.startsWith("/parkrunner")) {
		// map
		
		var events_table_rows;
		document.querySelectorAll("table#results").forEach((results_table) => {
			if (results_table.querySelector("thead > tr").children.length == 7) {
				events_table_rows = results_table.querySelector("tbody").children;
			}
		});

		var completed = [];
		for (let i = 0; i < events_table_rows.length; i++) {
			// 0: name
			// 1: number of completions
			// 2: best gender position
			// 3: best overall position
			// 4: best time 
			completed.push([
				events_table_rows[i].children[0].children[0].href.split("/")[3],
				parseInt(events_table_rows[i].children[1].innerText),
				parseInt(events_table_rows[i].children[2].innerText),
				parseInt(events_table_rows[i].children[3].innerText),
				events_table_rows[i].children[4].children[0].innerText
			]);
		}

		// stops the annoying build-up when reloading the extension over and over again
		var show_map_node = document.getElementById("parkstats_show_map");
		if (show_map_node == null) {
			show_map_node = document.createElement("a");
			show_map_node.id = "parkstats_show_map"
			show_map_node.href = "javascript:void(0);"
			show_map_node.style.margin_left = 50;
			show_map_node.innerText = get_localised_string("view_on_map");
			const parent = document.querySelector("#content > p");
			parent.appendChild(document.createElement("br"));
			parent.appendChild(document.createElement("br"));
			parent.appendChild(show_map_node);
		}
		show_map_node.onclick = function() {
			browser.runtime.sendMessage({data: completed, lang: lang, name: document.querySelector("h2").innerHTML.split("&nbsp;")[0]});
		}
	}
}

main();
