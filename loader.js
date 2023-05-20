// load maplibregl and then main content script

function load_parkmapper_js() {
	const parkmapper_js = document.createElement("script");
	parkmapper_js.type = "text/javascript";
	parkmapper_js.src = browser.runtime.getURL("parkmapper.js");
	document.head.appendChild(parkmapper_js);
}

function load_maplibregl_css() {
	const maplibregl_css = document.createElement("link");
	maplibregl_css.rel = "stylesheet";
	maplibregl_css.href = "https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.css";
	maplibregl_css.onload = load_parkmapper_js;
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
