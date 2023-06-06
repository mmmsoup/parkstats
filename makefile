NAME = parkstats
VERSION = 1.3

STATIC_SOURCE = background.js content.css content.js countries.geojson locale.js map.css map.html map.js

SRC_DIR = src
BUILD_DIR = build
EVENTS_RAW = $(BUILD_DIR)/events.json
EVENTS = events.json
COUNTRYCODES = countrycodes.json
LEAFLET_ARCHIVE = $(BUILD_DIR)/leaflet.zip
LEAFLET_DIR = leaflet

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

$(LEAFLET_ARCHIVE):
	wget -O $(LEAFLET_ARCHIVE) https://github.com/Leaflet/Leaflet/releases/download/v1.9.4/leaflet.zip

$(LEAFLET_DIR): $(LEAFLET_ARCHIVE)
	unzip $(LEAFLET_ARCHIVE) -d $(BUILD_DIR)
	mv $(BUILD_DIR)/dist $(LEAFLET_DIR)

manifest.json:
	if [[ "$(BROWSER_NAME)" == "firefox" ]]; then \
		cat manifest.json.in | jq '.version = "$(VERSION)"' | jq '.background.scripts = ["background.js"]' | jq '.background.persistent = false' > manifest.json; \
	elif [[ "$(BROWSER_NAME)" == "chromium" ]]; then \
		cat manifest.json.in | jq '.version = "$(VERSION)"' | jq '.background.service_worker = "background.js"' | jq '.manifest_version = 3' | jq 'del(.browser_specific_settings)' > manifest.json; \
	else \
		echo "unknown browser name '$1'" >&2; \
		exit 1; \
	fi

$(FIREFOX_PACKAGE): $(BUILD_DIR) $(LEAFLET_DIR) $(COUNTRYCODES) $(EVENTS) $(STATIC_SOURCE) manifest.json.in
	rm -f manifest.json
	make --eval "BROWSER_NAME = firefox" manifest.json
	web-ext build --artifacts-dir $(BUILD_DIR) --filename $(shell basename $(FIREFOX_PACKAGE)) --overwrite-dest

$(CHROMIUM_PACKAGE): $(BUILD_DIR) $(LEAFLET_DIR) $(COUNTRYCODES) $(EVENTS) $(STATIC_SOURCE) manifest.json.in
	rm -f manifest.json
	make --eval "BROWSER_NAME = chromium" manifest.json
	web-ext build --artifacts-dir $(BUILD_DIR) --filename $(shell basename $(CHROMIUM_PACKAGE)) --overwrite-dest

clean:
	rm -rf $(BUILD_DIR)
	rm -rf leaflet
	rm -f countrycodes.json
	rm -f events.json
	rm -f manifest.json
