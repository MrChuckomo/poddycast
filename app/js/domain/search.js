'use strict';

const { ipcRenderer } = require('electron');
const itunes = require('./itunes');
const request = require('./request');
const navigation = require('../helper/helper_navigation');
const global = require('../helper/helper_global');
const entries = require('../helper/helper_entries');
let CContentHelper = require('../helper/content');

let helper = new CContentHelper();


// ---------------------------------------------------------------------------------------------------------------------

function search(_Value, _Key) {
    switch (_Key) {
        case 'Enter': doSearch(_Value); break;
        case 'Escape': clearSearch(); break;
        default: break;
    }
}
module.exports.search = search;


// ---------------------------------------------------------------------------------------------------------------------

/**
 * @private
 * Do the actual search work.
 * @param {string} _Value
 */
function doSearch(_Value) {
    helper.clearContent();
    navigation.setHeaderViewAction();
    navigation.clearMenuSelection();
    ipcRenderer.invoke('i18n', 'Search').then((title) => helper.setHeader(title));
    document.getElementById('res').setAttribute('return-value', '');

    if (_Value.includes('http') && _Value.includes(':') && _Value.includes('//')) {
        processPodcastsFromFeed(_Value);
    } else {
        (_Value !== null && _Value !== '')
            ? itunes.getPodcasts(_Value)
            : itunes.getDiscover();
    }
}

/**
 * @private
 */
function clearSearch() {
    document.getElementById('search-input').value = '';
}


// ---------------------------------------------------------------------------------------------------------------------
// MARK: RSS feed URLs
// ---------------------------------------------------------------------------------------------------------------------

/**
 * @private
 * Handles directly pasted feed URLs from the search field.
 * @param {string} _FeedUrl
 */
function processPodcastsFromFeed(_FeedUrl) {
    request.requestPodcastFeed(_FeedUrl).then(result => {
        renderFeedResults(result);
    });
}

/**
 * @private
 * Render a search result for the pasted feed.
 * @param {object} _PodcastObject
 */
function renderFeedResults(_PodcastObject) {

    const Image = _PodcastObject.image;
    // this is a catch for Patreon feeds which do not have an author value
    const Author = _PodcastObject.items[0].author === undefined
        ? _PodcastObject.title
        : _PodcastObject.items[0].author;

    if (Image === undefined || Author === undefined) {
        console.log(_PodcastObject);
        console.error('Invalid RSS podcast feed');
    }

    helper.clearContent();

    let List = document.getElementById('list');

    navigation.setGridLayout(List, false);

    let PodcastInfos = {
        'feedUrl': _PodcastObject.link,
        'artistName': Author,
        'collectionName': _PodcastObject.title,
        'artworkUrl30': Image,
        'artworkUrl60': Image,
        'artworkUrl100': Image
    };

    let Icon = (global.isAlreadySaved(PodcastInfos.feedUrl))
        ? itunes.getFullIcon(PodcastInfos)
        : itunes.getIcon(PodcastInfos);

    List.append(entries.getPodcastElement(
        null,
        PodcastInfos.artworkUrl60,
        PodcastInfos.artistName,
        PodcastInfos.collectionName,
        Icon
    ));
}
