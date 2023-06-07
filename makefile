NAME = parkstats
VERSION = 1.4

# config for COUNTRYGEOJSON (from https://github.com/AshKyd/geojson-regions)
# resolution: one of 10m, 50m, 110m
# properties include names in all languages that parkrun websites are in
GEOJSON_RESOLUTION = 50m
GEOJSON_PROPERTIES = ["iso_a3", "name_en", "name_da", "name_de", "name_fr", "name_it", "name_ja", "name_nl", "name_pl", "name_sv"]

STATIC_SOURCE = background.js content.css content.js locale.js map.css map.html map.js
WEBEXT_IGNORE = build geojson-regions leaflet/dist LICENCE makefile manifest.json.in mapdemo.gif node_modules package.json package-lock.json README.md

SRC_DIR = src
BUILD_DIR = build
EVENTS_RAW = $(BUILD_DIR)/events.json
EVENTS = events.json
COUNTRYCODES = countrycodes.json
COUNTRYGEOJSON = countries.geojson
LEAFLET = leaflet
WEBEXT = $(NODE)/web-ext/bin/web-ext.js
NODE = node_modules

FIREFOX_PACKAGE = $(BUILD_DIR)/$(NAME)-$(VERSION)-firefox.zip
CHROMIUM_PACKAGE = $(BUILD_DIR)/$(NAME)-$(VERSION)-chromium.zip

$(NAME): $(FIREFOX_PACKAGE)
firefox: $(FIREFOX_PACKAGE)
chromium: $(CHROMIUM_PACKAGE)

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

$(EVENTS_RAW):
	curl https://images.parkrun.com/events.json > $(EVENTS_RAW)

$(EVENTS): $(EVENTS_RAW)
	cat $(EVENTS_RAW) | jq '.events.features[] | { (.properties.eventname): { "coords": [ .geometry.coordinates[1], .geometry.coordinates[0] ], "longname": .properties.EventLongName, "junior": (.properties.seriesid == 2), "location": .properties.EventLocation, "countrycode": .properties.countrycode } }' | jq -s add > $(EVENTS)

$(COUNTRYCODES): $(EVENTS_RAW)
	cat $(EVENTS_RAW) | jq '.countries | map_values(.url)' > $(COUNTRYCODES)

$(NODE):
	npm install

$(LEAFLET): $(NODE)
	ln -s $$(pwd)/$(NODE)/leaflet/dist $$(pwd)/$(LEAFLET)

$(WEBEXT): $(NODE)

geojson-regions/countries/$(GEOJSON_RESOLUTION): 
	git submodule update --init

$(COUNTRYGEOJSON): geojson-regions/countries/$(GEOJSON_RESOLUTION)
	echo -n '{"type":"FeatureCollection","features":' > $(COUNTRYGEOJSON)

	jq '{ type: "Feature", properties: .properties | with_entries(select([.key] | inside($(GEOJSON_PROPERTIES)))), geometry: .geometry }' $$(echo geojson-regions/countries/$(GEOJSON_RESOLUTION)/* | grep -o "geojson-regions/countries/$(GEOJSON_RESOLUTION)/[A-Z]\{3\}.geojson") | jq --slurp --compact-output . >> $(COUNTRYGEOJSON)
	
	echo -n "}" >> $(COUNTRYGEOJSON)

manifest.json:
	if [[ "$(BROWSER_NAME)" == "firefox" ]]; then \
		cat manifest.json.in | jq '.version = "$(VERSION)"' | jq '.background.scripts = ["background.js"]' | jq '.background.persistent = false' > manifest.json; \
	elif [[ "$(BROWSER_NAME)" == "chromium" ]]; then \
		cat manifest.json.in | jq '.version = "$(VERSION)"' | jq '.background.service_worker = "background.js"' | jq '.manifest_version = 3' | jq 'del(.browser_specific_settings)' > manifest.json; \
	else \
		echo "unknown browser name '$1'" >&2; \
		exit 1; \
	fi

$(FIREFOX_PACKAGE): $(BUILD_DIR) $(WEBEXT) $(LEAFLET) $(COUNTRYCODES) $(COUNTRYGEOJSON) $(EVENTS) $(STATIC_SOURCE) manifest.json.in
	rm -f manifest.json
	make --eval "BROWSER_NAME = firefox" manifest.json
	npx web-ext build --artifacts-dir $(BUILD_DIR) --filename $(shell basename $(FIREFOX_PACKAGE)) --ignore-files $(WEBEXT_IGNORE) --overwrite-dest

$(CHROMIUM_PACKAGE): $(BUILD_DIR) $(WEBEXT) $(LEAFLET) $(COUNTRYCODES) $(COUNTRYGEOJSON) $(EVENTS) $(STATIC_SOURCE) manifest.json.in
	rm -f manifest.json
	make --eval "BROWSER_NAME = chromium" manifest.json
	npx web-ext build --artifacts-dir $(BUILD_DIR) --filename $(shell basename $(CHROMIUM_PACKAGE)) --ignore-files $(WEBEXT_IGNORE) --overwrite-dest

clean:
	rm -rf $(BUILD_DIR)
	rm -rf $(NODE)
	rm -rf $(LEAFLET)
	rm -f $(COUNTRYCODES)
	rm -f $(COUNTRYGEOJSON)
	rm -f $(EVENTS)
	rm -f manifest.json
