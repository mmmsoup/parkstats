# parkstats: stats for parkrun!

**Disclaimer**: please note that this project is in no way affiliated with or endorsed by [Parkrun](https://www.parkrun.com) - it's just a silly little project by an avid parkrunner and computer geek :)

## About

A webextension that adds extra functionality (and by that I mean gimmicks and eye-candy) to the parkrun website, namely:

- a map with a toggle to show either all or only completed parkruns as well as summary information for completed parkruns (access from the link added below the 'view all stats for this parkrunner' button on a parkrunner's summary statistics page)
![map demonstration](mapdemo.gif)

- [parkrun bingo](https://www.parkrun.org.uk/cranleigh/news/2020/07/11/are-you-playing-or-will-start-parkrun-bingo/) progress for every parkrunner added to the bottom of their 'all results' page

## Building
1. make sure you have the following build dependencies installed: [curl](https://curl.se), [git](https://git-scm.com), [jq](https://stedolan.github.io/jq), [make](https://www.gnu.org/software/make), and [npm](https://www.npmjs.com) (it is assumed you have a \*nix system with access to the [GNU Coreutils](https://www.gnu.org/software/coreutils)), for example `pacman -S curl git jq make npm` (or whatever your package manager is)
2. clone and enter the repository: `git clone --recurse-submodules https://github.com/mmmsoup/parkstats && cd parkstats`
3. run `make` to install node dependencies and generate some files

running `make firefox` or `make chromium` will generate a `manifest.json` for installation in either browser, and `make clean` will remove all built files

## Installation
currently manually is the only method... but not for long (hopefully!)
### Manual
1. follow the [build instructions](#building) and build the extension for your browser of choice: `make firefox` (for Firefox and its derivatives) or `make chromium` (for Chromium-based browsers).
2. load the extension (this differs between Firefox and Chromium):
    - for Firefox, go to `about:debugging#/runtime/this-firefox`, click 'Load Temporary Add-on...', and then select either `manifest.json` (easier for development) or the generated `parkstats/build/parkstats-*.*-firefox.zip`
    - for Chromium, go to `chrome://extensions`, click 'Load unpacked' (you may first have to enable developer mode in the top right), and then select the `parkstats` directory
3. rejoice! you now have everything you could ever want in life

## Translations
I have made a vain attempt to internationalise this so that it fits in with the various non-English parkrun websites but if you can offer any improvements over the current translations (or can help with the Japanese translation as I have no idea where to even start with that) please submit a pull request!

## Attribution and Thanks
- the [leaflet.js](https://leafletjs.com) library by [Volodymyr Agafonkin](https://agafonkin.com) for map rendering
- [GeoJSON regions](https://github.com/AshKyd/geojson-regions) by [AshKyd](https://github.com/AshKyd) (which in turn uses data from [Natural Earth Data](https://www.naturalearthdata.com)) for the world map outline
- parkrun event data from https://images.parkrun.com/events.json

and obviously a massive thanks to the many volunteers around the world who make parkrun possible for all of us :)
