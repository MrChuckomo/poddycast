'use strict';

const listItem = require('../list_item');
const global = require('../../helper/helper_global');
const navigation = require('../../helper/helper_navigation');
const CContentHelper = require('../../helper/content');

const helper = new CContentHelper();


/**
 * Build te UI for the basic search results.
 * @param {Array} searchData
 */
function buildResults(searchData) {
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
module.exports.buildResults = buildResults;

/**
 * Build the UI for the Discover view.
 * TODO: Same as the "normal" search results atm.
 * @param {Array} searchData
 */
function buildDiscover(searchData) {
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
module.exports.buildDiscover = buildDiscover;
