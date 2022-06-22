'use strict';

let CContentHelper = require('./helper/content');
let helper = new CContentHelper();
const itunes = require('./itunes');
const request = require('./request');
const navigation = require('./helper/helper_navigation');
const global = require('./helper/helper_global');
const entries = require('./helper/helper_entries');
const i18n = window.i18n;


// function search(_Self, _Event) {
function search(_Value, _Key) {
    if (_Key === 'Enter') {
        helper.clearContent();
        navigation.setHeaderViewAction();
        navigation.clearMenuSelection();
        // TODO: needs solution for i18n for IPC concept
        // helper.setHeader(i18n.__('Search'));
        document.getElementById('res').setAttribute('return-value', '');

        if (_Value.includes('http') && _Value.includes(':') && _Value.includes('//')) {
            getPodcastsFromFeed(_Value);
        } else {
            itunes.getPodcasts(_Value);
        }
    } else if (_Key === 'Escape') {
        document.getElementById('search-input').value = '';
    }
}
module.exports.search = search;

// ---------------------------------------------------------------------------------------------------------------------

function getPodcastsFromFeed(feedUrl) {
    request.requestPodcastFeed(feedUrl).then(result => {
        getFeedResults(result);
    });
}

function getFeedResults(podcastObject) {

    const Image = podcastObject.image;
    // this is a catch for Patreon feeds which do not have an author value
    const Author = podcastObject.items[0].author === undefined ? podcastObject.title : podcastObject.items[0].author;

    if (Image === undefined || Author === undefined) {
        console.log(podcastObject);
        console.error('Invalid RSS podcast feed');
    }

    helper.clearContent();

    let List = document.getElementById('list');

    navigation.setGridLayout(List, false);

    let PodcastInfos = {
        'feedUrl': podcastObject.link,
        'artistName': Author,
        'collectionName': podcastObject.title,
        'artworkUrl30': Image,
        'artworkUrl60': Image,
        'artworkUrl100': Image
    };

    let Icon = itunes.getIcon(PodcastInfos);

    if (global.isAlreadySaved(PodcastInfos.feedUrl)) {
        Icon = itunes.getFullIcon(PodcastInfos);
    }

    List.append(entries.getPodcastElement(null, PodcastInfos.artworkUrl60, PodcastInfos.artistName, PodcastInfos.collectionName, Icon));
}
