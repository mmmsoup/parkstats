// load maplibregl and then main content script

function load_js(uri) {
	return new Promise((resolve, reject) => {
		const element = document.createElement("script");
		element.type = "text/javascript";
		element.src = uri;
		element.onload = resolve;
		document.head.appendChild(element);
	});
}

function load_css(uri) {
	return new Promise((resolve, reject) => {
		const element = document.createElement("link");
		element.rel = "stylesheet";
		element.href = uri;
		element.onload = resolve;
		document.head.appendChild(element);
	});
}

load_js("https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.js").then(() => {
	load_css("https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.css")
}).then(() => {
	return new Promise((resolve, reject) => {
		var request = new XMLHttpRequest();
		request.onreadystatechange = function() {
			if (this.status == 200 && this.readyState == 4) {
				const element = document.createElement("script");
				element.innerHTML = "const parkstats_locale_data = "+this.responseText;
				document.head.appendChild(element);
				resolve();
			}
		}
		request.open("GET", browser.runtime.getURL("locale.json"), true);
		request.send();
	});
}).then(() => {
	load_js(browser.runtime.getURL("parkstats.js"))
});

/*
function load_parkstats_js() {
	const parkstats_js = document.createElement("script");
	parkstats_js.type = "text/javascript";
	parkstats_js.src = browser.runtime.getURL("parkstats.js");
	document.head.appendChild(parkstats_js);
}

function load_maplibregl_css() {
	const maplibregl_css = document.createElement("link");
	maplibregl_css.rel = "stylesheet";
	maplibregl_css.href = "https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.css";
	maplibregl_css.onload = load_parkstats_js;
	document.head.appendChild(maplibregl_css);
}

function load_maplibregl_js() {
	const maplibregl_js = document.createElement("script");
	maplibregl_js.type = "text/javascript";
	maplibregl_js.src = "https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.js";
	maplibregl_js.onload = load_maplibregl_css;
	document.head.appendChild(maplibregl_js);
}

load_maplibregl_js();
*/
