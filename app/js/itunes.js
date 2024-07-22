'use strict';

const CContentHelper = require('./helper/content');
const helper = new CContentHelper();
const request = require('./request');
const global = require('./helper/helper_global');
const navigation = require('./helper/helper_navigation');
const listItem = require('./list_item');

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

        PodcastInfos['isFullIcon'] = global.isAlreadySaved(PodcastInfos.feedUrl)
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
// IMAGE ICONS
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

    let Icon = `<i class="bi bi-bookmark-heart" onclick="window.navAPI.subscribePodcast(this, '${artists}', '${collection}', '${artwork30}', '${artwork60}', '${artwork100}', '${feedUrl}')" style="font-size: 1.5rem;"></i>`;
    // `
    //     <svg onclick="favorite.setFavorite(this, '${artists}', '${collection}', '${artwork30}', '${artwork60}', '${artwork100}', '${feedUrl}')" fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
    //         <path d="M0 0h24v24H0z" fill="none"/>
    //         <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
    //     </svg>
    // `;

    return Icon;
}
module.exports.getIcon = getIcon;

function getFullIcon() {
    let Icon = '<i class="bi bi-bookmark-heart-fill set-favorite" style="font-size: 1.5rem;"></i>';
    // `
    //     <svg class="set-favorite" fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
    //         <path d="M0 0h24v24H0z" fill="none"/>
    //         <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    //     </svg>
    // `;

    return Icon;
}
module.exports.getFullIcon = getFullIcon;
