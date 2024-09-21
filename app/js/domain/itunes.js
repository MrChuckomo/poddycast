'use strict';

const request = require('./request');
const listItem = require('../interface/list_item');
const global = require('../helper/helper_global');
const navigation = require('../helper/helper_navigation');
const CContentHelper = require('../helper/content');

const helper = new CContentHelper();

// https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api/#overview
// https://itunes.apple.com/search?term=freakshow&media=podcast


function getPodcasts(searchTerm) {
    searchTerm = encodeURIComponent(searchTerm);

    const searchUrl = `https://itunes.apple.com/search?term=${searchTerm}&media=podcast`;

    request
        .requestPodcastFeed(searchUrl, true)
        .then((xml) => {
            getResults(xml);
        })
        .catch((error) => {
            console.error(error);
        });
}
module.exports.getPodcasts = getPodcasts;

function getResults(searchData) {
    helper.clearContent();

    let List = document.getElementById('list');

    navigation.setGridLayout(List, false);
    navigation.setFlowLayout(List, true);

    searchData.results.forEach(episode => {
        let PodcastInfos = {
            'artistName': episode.artistName,
            'artworkUrl100': episode.artworkUrl100,
            'artworkUrl30': episode.artworkUrl30,
            'artworkUrl60': episode.artworkUrl60,
            'artworkUrl600': episode.artworkUrl600,
            'collectionName': episode.collectionName,
            'feedUrl': episode.feedUrl
        };

        PodcastInfos['isFullIcon'] = global.isAlreadySaved(PodcastInfos.feedUrl);
        List.append(listItem.renderNewSearchResultItem(PodcastInfos));
    });
}

// TODO: Remove because it is not being used.
// eslint-disable-next-line no-unused-vars
function getCollectionName() {
    let chunk = document.getElementById('res').innerHTML;
    let obj = JSON.parse(chunk);

    for (let i = 0; i < obj.results.length; i++) {
        console.log(obj.results[i].collectionName);
    }
}

// TODO: Remove because it is not being used.
// eslint-disable-next-line no-unused-vars
function getArtWork() {
    let chunk = document.getElementById('res').innerHTML;
    let obj = JSON.parse(chunk);

    for (let i = 0; i < obj.results.length; i++) {
        console.log(obj.results[i].artworkUrl30);
        console.log(obj.results[i].artworkUrl60);
        console.log(obj.results[i].artworkUrl100);
    }
}

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
