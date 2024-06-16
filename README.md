# parkstats: stats for parkrun!

**Disclaimer**: please note that this project is in no way affiliated with or endorsed by [Parkrun](https://www.parkrun.com) - it's just a silly little project by an avid parkrunner and computer geek :)

## About

A webextension that adds extra functionality (and by that I mean gimmicks and eye-candy) to the parkrun website, namely:

- a map with a toggle to show either all or only completed parkruns as well as summary information for completed parkruns (access from the link added below the 'view all stats for this parkrunner' button on a parkrunner's summary statistics page)
![map demonstration](mapdemo.gif)

- [parkrun bingo](https://www.parkrun.org.uk/cranleigh/news/2020/07/11/are-you-playing-or-will-start-parkrun-bingo/) progress for every parkrunner added to the bottom of their 'all results' page

## Installation
Currently manually is the only method... but not for long (hopefully)! Either download the [latest release](https://github.com/mmmsoup/parkstats/releases) or [build it yourself](#building):)
### Manual
1. download the latest Firefox or Chromium [release](https://github.com/mmmsoup/parkstats/releases), or alternatively follow the [build instructions](#building) and build the extension for your browser of choice: `make firefox` (for Firefox and its derivatives) or `make chromium` (for Chromium-based browsers).
2. load the extension (this differs between Firefox and Chromium):
    - for Firefox, go to `about:debugging#/runtime/this-firefox`, click 'Load Temporary Add-on...', and then select either `manifest.json` (easier for development) or the generated `parkstats/build/parkstats-*.*-firefox.zip`. If you use Firefox Developer Edition, then you can also go to `about:addons` and install the packaged extension there (this way, you will not have to re-install it every time you start Firefox)
    - for Chromium, if you have downloaded the release build, then you will first have to extract the `.zip` file. Go to `chrome://extensions`, click 'Load unpacked' (you may first have to enable developer mode in the top right), and then select the directory containing `manifest.json`: this will be either wherever you extracted the release to or the cloned repository (if you built the extension yourself)
3. rejoice! you now have everything you could ever want in life (probably)

## Building
1. make sure you have the following build dependencies installed: [`curl`](https://curl.se), [`git`](https://git-scm.com), [`jq`](https://stedolan.github.io/jq), [`make`](https://www.gnu.org/software/make), and [`npm`](https://www.npmjs.com), for example `pacman -S curl git jq make npm` on Arch Linux
2. clone and enter the repository: `git clone --recurse-submodules https://github.com/mmmsoup/parkstats && cd parkstats`
3. run `make` to install node dependencies and generate some files

running `make firefox` or `make chromium` will generate a `manifest.json` for installation in either browser, and `make clean` will remove all built files

## Translations
I have made a vain attempt to internationalise this so that it fits in with the various non-English parkrun websites but if you can offer any improvements over the current translations (or can help with the Japanese translation as I have no idea where to even start with that) please submit a pull request!

## Attribution and Thanks
- the [leaflet.js](https://leafletjs.com) library by [Volodymyr Agafonkin](https://agafonkin.com) for map rendering
- [GeoJSON regions](https://github.com/AshKyd/geojson-regions) by [AshKyd](https://github.com/AshKyd) (which in turn uses data from [Natural Earth Data](https://www.naturalearthdata.com)) for the world map outline
- parkrun event data from https://images.parkrun.com/events.json

and obviously a massive thanks to the many volunteers around the world who make parkrun possible for all of us :)
