'use strict';

const global = require('./helper/helper_global');
const { setItemCounts } = require('./helper/helper_navigation');
const fs = require('fs');

function setFavorite(_Self, _ArtistName, _CollectionName, _Artwork30, _Artwork60, _Artwork100, _FeedUrl) {
    let Feed = {
        'artistName': global.sanitizeString(_ArtistName),
        'collectionName': global.sanitizeString(_CollectionName),
        'artworkUrl30': global.sanitizeString(_Artwork30),
        'artworkUrl60': global.sanitizeString(_Artwork60),
        'artworkUrl100': global.sanitizeString(_Artwork100),
        'feedUrl': _FeedUrl,
        'addToInbox': true,
        'feedUrlStatus': 200 // Set default URL status to 200
    };

    if (_Self !== null) {
        _Self.classList.remove('bi-bookmark-heart');
        _Self.classList.add('set-favorite', 'bi-bookmark-heart-fill');
    }

    let JsonContent = [];

    if (global.fileExistsAndIsNotEmpty(global.saveFilePath)) {
        JsonContent = JSON.parse(fs.readFileSync(global.saveFilePath, 'utf-8'));
    } else {
        fs.writeFileSync(global.saveFilePath, JSON.stringify(JsonContent));
    }

    if (!global.isAlreadySaved(_FeedUrl)) {
        JsonContent.push(Feed);
    }

    fs.writeFileSync(global.saveFilePath, JSON.stringify(JsonContent));

    setItemCounts();
}
module.exports.setFavorite = setFavorite;
