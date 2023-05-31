# parkstats: stats for parkrun!

**Disclaimer**: please note that this project is in no way affiliated with or endorsed by [Parkrun](https://www.parkrun.com) - it's just a silly little project by an avid parkrunner and computer geek :)

## About

A webextension that adds extra functionality (and by that I mean gimmicks and eye-candy) to the parkrun website, namely:

- a map with a toggle to show either all or only completed parkruns as well as summary information for completed parkruns (access from the link added below the 'view all stats for this parkrunner' button on a parkrunner's summary statistics page)
![map demonstration](mapdemo.gif)

- [parkrun bingo](https://www.parkrun.org.uk/cranleigh/news/2020/07/11/are-you-playing-or-will-start-parkrun-bingo/) progress for every parkrunner added to the bottom of their 'all results' page

## Installation
currently manually is the only method... but not for long (hopefully!)
### Firefox
#### Manual
1. clone and enter the repository: `git clone https://github.com/mmmsoup/parkstats && cd parkstats`
2. build the extension for Firefox: `make firefox`
3. go to `about:debugging#/runtime/this-firefox` in Firefox, click 'Load Temporary Add-on...', and then select the newly created `parkstats/build/parkstats-_._-firefox.zip` (with `_._` being the current version number)
4. rejoice! you now have everything you could ever want in life

### Chrome
Currently the Chrome version barely works and also has *really* bad performance compared to Firefox when loading the map?? **TODO** is certainly to make the Chrome version at least somewhat usable. For the curious:
#### Manual
1. clone and enter the repository: `git clone https://github.com/mmmsoup/parkstats && cd parkstats`
2. build the extension for Chrome: `make chrome`
3. go to `chrome://extensions` in Chrome, click 'Load unpacked' (you may first have to enable developer mode in the top right), and then select the `parkstats` directory.
4. et voilà - enjoy... I guess?

## Translations
I have made a vain attempt to internationalise this so that it fits in with the various non-English parkrun websites but if you can offer any improvements over the current translations (or can help with the Japanese translation as I have no idea where to even start with that) please submit a pull request!

## Attribution and Thanks
- the [leaflet.js](https://leafletjs.com) library by [Volodymyr Agafonkin](https://agafonkin.com) for map rendering
- [GeoJSON regions](https://geojson-maps.ash.ms/) by [AshKyd](https://github.com/AshKyd) (which in turn uses data from [Natural Earth Data](https://www.naturalearthdata.com)) for the world map outline
- parkrun event data from https://images.parkrun.com/events.json

and obviously a massive thanks to the many volunteers around the world who make parkrun possible for all of us :)
