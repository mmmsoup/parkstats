NAME = parkstats
VERSION = 1.3

STATIC_SOURCE = background.js content.css content.js countries.geojson locale.js map.css map.html map.js
WEBEXT_IGNORE = "build/*" LICENCE makefile manifest.json.in mapdemo.gif "node_modules/*" package.json package-lock.json README.md

SRC_DIR = src
BUILD_DIR = build
EVENTS_RAW = $(BUILD_DIR)/events.json
EVENTS = events.json
COUNTRYCODES = countrycodes.json
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
	wget -O $(EVENTS_RAW) https://images.parkrun.com/events.json

$(EVENTS): $(EVENTS_RAW)
	cat $(EVENTS_RAW) | jq '.events.features[] | { (.properties.eventname): { "coords": [ .geometry.coordinates[1], .geometry.coordinates[0] ], "longname": .properties.EventLongName, "junior": (.properties.seriesid == 2), "location": .properties.EventLocation, "countrycode": .properties.countrycode } }' | jq -s add > $(EVENTS)

$(COUNTRYCODES): $(EVENTS_RAW)
	cat $(EVENTS_RAW) | jq '.countries | map_values(.url)' > $(COUNTRYCODES)

$(NODE):
	npm install

$(LEAFLET): $(NODE)
	ln -s $$(pwd)/$(NODE)/leaflet/dist $$(pwd)/$(LEAFLET)

$(WEBEXT): $(NODE)

manifest.json:
	if [[ "$(BROWSER_NAME)" == "firefox" ]]; then \
		cat manifest.json.in | jq '.version = "$(VERSION)"' | jq '.background.scripts = ["background.js"]' | jq '.background.persistent = false' > manifest.json; \
	elif [[ "$(BROWSER_NAME)" == "chromium" ]]; then \
		cat manifest.json.in | jq '.version = "$(VERSION)"' | jq '.background.service_worker = "background.js"' | jq '.manifest_version = 3' | jq 'del(.browser_specific_settings)' > manifest.json; \
	else \
		echo "unknown browser name '$1'" >&2; \
		exit 1; \
	fi

$(FIREFOX_PACKAGE): $(BUILD_DIR) $(WEBEXT) $(LEAFLET) $(COUNTRYCODES) $(EVENTS) $(STATIC_SOURCE) manifest.json.in
	rm -f manifest.json
	make --eval "BROWSER_NAME = firefox" manifest.json
	npx web-ext build --artifacts-dir $(BUILD_DIR) --filename $(shell basename $(FIREFOX_PACKAGE)) --ignore-files $(WEBEXT_IGNORE) --overwrite-dest

$(CHROMIUM_PACKAGE): $(BUILD_DIR) $(WEBEXT) $(LEAFLET) $(COUNTRYCODES) $(EVENTS) $(STATIC_SOURCE) manifest.json.in
	rm -f manifest.json
	make --eval "BROWSER_NAME = chromium" manifest.json
	npx web-ext build --artifacts-dir $(BUILD_DIR) --filename $(shell basename $(CHROMIUM_PACKAGE)) --ignore-files $(WEBEXT_IGNORE) --overwrite-dest

clean:
	rm -rf $(BUILD_DIR)
	rm -rf $(NODE)
	rm -rf $(LEAFLET)
	rm -f $(COUNTRYCODES)
	rm -f $(EVENTS)
	rm -f manifest.json
