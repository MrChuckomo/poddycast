'use strict';

const request = require('./request');
const { ITunesSearchApi, Categoires } = require('../classes/itunes_search_api');
const searchView = require('../interface/views/search_view');

/**
 * https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api/#overview
 * Search Podcast:  "https://itunes.apple.com/search?media=podcast&term=freakshow"
 * Search Category: "https://itunes.apple.com/search?media=podcast&limit=10&term=comedy"
 */
function getPodcasts(searchTerm) {
    let itunes = new ITunesSearchApi();
    searchTerm = encodeURIComponent(searchTerm);
    request
        .requestPodcastFeed(itunes.podcast(searchTerm), true)
        .then((xml) => {
            searchView.buildResults(xml);
        })
        .catch((error) => {
            console.error(error);
        });
}
module.exports.getPodcasts = getPodcasts;

/**
 * Pass in a valid Categorie from the itunes_search_api module.
 * And render the Top10 Results.
 * @param {itunes_search_api::Categorie} category
 */
function getTop10(category) {
    let itunes = new ITunesSearchApi();
    request
        .requestPodcastFeed(itunes.top10(category), true)
        .then((xml) => {
            searchView.buildResults(xml);
        })
        .catch((error) => {
            console.error(error);
        });
}
module.exports.getTop10 = getTop10;

/**
 * A pre-defined search to build the
 * discover view with different catagories.
 */
function getDiscover() {
    let itunes = new ITunesSearchApi();
    request
        .requestPodcastFeed(itunes.top10(Categoires.TECHNOLOGY), true)
        .then((xml) => {
            searchView.buildDiscover(xml);
        })
        .catch((error) => {
            console.error(error);
        });
}
module.exports.getDiscover = getDiscover;


// ---------------------------------------------------------------------------------------------------------------------
// MARK: Image Icons
// ---------------------------------------------------------------------------------------------------------------------

function getIcon(_PodcastInfos) {
    // TODO: figure out how to resolve these lint warnings without ruining the replace logic
    // eslint-disable-next-line quotes, no-useless-escape
    let artists = _PodcastInfos.artistName.replace(/([\'])/g, "\\'").replace(/([\"])/g, '&quot;');
    // eslint-disable-next-line quotes, no-useless-escape
    let collection = _PodcastInfos.collectionName.replace(/([\'])/g, "\\'").replace(/([\"])/g, '&quot;');
    let artwork30 = _PodcastInfos.artworkUrl30;
    let artwork60 = _PodcastInfos.artworkUrl60;
    let artwork100 = _PodcastInfos.artworkUrl100;
    let feedUrl = _PodcastInfos.feedUrl;

    return `<i
      class="bi bi-bookmark"
      onclick="window.navAPI.subscribePodcast(this, '${artists}', '${collection}', '${artwork30}', '${artwork60}', '${artwork100}', '${feedUrl}')"
      style="font-size: 1.5rem;">
    </i>`;
}
module.exports.getIcon = getIcon;

function getFullIcon() {
    return '<i class="bi bi-bookmark set-favorite" style="font-size: 1.5rem;"></i>';
}
module.exports.getFullIcon = getFullIcon;
