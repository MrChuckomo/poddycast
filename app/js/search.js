'use strict';

let CContentHelper = require('./helper/content');
let helper = new CContentHelper();
const itunes = require('./itunes');
const request = require('./request');
const navigation = require('./helper/helper_navigation');
const global = require('./helper/helper_global');
const entries = require('./helper/helper_entries');
const { ipcRenderer } = require('electron');


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
        getPodcastsFromFeed(_Value);
    } else {
        itunes.getPodcasts(_Value);
    }
}

/**
 * @private
 */
function clearSearch() {
    document.getElementById('search-input').value = '';
}


// ---------------------------------------------------------------------------------------------------------------------
// MARK: Patreon feeds
// ---------------------------------------------------------------------------------------------------------------------

/**
 * @private
 * Handles directly pasted feed URLs in the search field.
 * @param {string} _FeedUrl
 */
function getPodcastsFromFeed(_FeedUrl) {
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

    List.append(entries.getPodcastElement(
        null,
        PodcastInfos.artworkUrl60,
        PodcastInfos.artistName,
        PodcastInfos.collectionName,
        Icon)
    );
}
