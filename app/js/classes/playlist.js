'use strict';

const fs = require('fs');
const global = require('./../helper/helper_global');


// ---------------------------------------------------------------------------------------------------------------------

class CPlaylist {
    constructor(id, playlistName, items) {
        this.id = id;
        this.playlistName = playlistName;
        this.items = items;
    }

    addItem(item) {
        this.items.push(item);
        this.items.append(item);
    }

    removeItem(item) {
        // this.items.foreach(element) {
        //     return element === item ? true : false
        // }
    }

    getItemCount() {
        return this.items.lenght;
    }
}
module.exports.CPlaylist = CPlaylist;

function getLatestEpisodePlaylist() {
    CPlaylist();
}

/**
 * Helper to load all the playlist data and return as model.
 * @returns {Array<CPlaylist>}
 */
function loadAllPlaylists() {
    if (!global.fileExistsAndIsNotEmpty(global.playlistFilePath)) {
        return allPlaylists;
    }

    let allPlaylists = [];
    let JsonContent = JSON.parse(fs.readFileSync(global.playlistFilePath, 'utf-8'));

    for (let i = 0; i < JsonContent.length; i++) {
        allPlaylists.push(new CPlaylist(
            'playlist-' + JsonContent[i].playlistName.toLowerCase().replaceAll(' ', '-'),
            JsonContent[i].playlistName,
            getEpisodesInPlayist(JsonContent[i].playlistName)
        ));
    }
    return allPlaylists;
}
module.exports.loadAllPlaylists = loadAllPlaylists;

/**
 * Collect all episodes associated with the playlist
 * @param {string} _PlaylistName
 * @returns {Array}
 */
function getEpisodesInPlayist(_PlaylistName) {
    let Episodes = [];
    let JsonContent = JSON.parse(fs.readFileSync(global.playlistFilePath, 'utf-8'));

    for (let i = 0; i < JsonContent.length; i++) {
        if (_PlaylistName !== JsonContent[i].playlistName) { continue }
        if (!global.fileExistsAndIsNotEmpty(global.newEpisodesSaveFilePath)) { continue }

        let NewEpisodesJsonContent = JSON.parse(fs.readFileSync(global.newEpisodesSaveFilePath, 'utf-8'));

        for (let a = 0; a < NewEpisodesJsonContent.length; a++) {
            let Artwork = global.getValueFromFile(global.saveFilePath, 'artworkUrl60', 'collectionName', NewEpisodesJsonContent[a].channelName);

            if ((global.getValueFromFile(global.saveFilePath, 'artworkUrl100', 'collectionName', NewEpisodesJsonContent[a].channelName) !== undefined) &&
                (global.getValueFromFile(global.saveFilePath, 'artworkUrl100', 'collectionName', NewEpisodesJsonContent[a].channelName) !== 'undefined')) {
                Artwork = global.getValueFromFile(global.saveFilePath, 'artworkUrl100', 'collectionName', NewEpisodesJsonContent[a].channelName);
            }

            if (Artwork === null) { continue }

            let EpisodeItem = {
                'channel': NewEpisodesJsonContent[a].channelName,
                'title': NewEpisodesJsonContent[a].episodeTitle,
                'type': NewEpisodesJsonContent[a].episodeType,
                'url': NewEpisodesJsonContent[a].episodeUrl,
                'length': NewEpisodesJsonContent[a].episodeLength,
                'artworkUrl': Artwork,
                'episodeImagekUrl': NewEpisodesJsonContent[a].episodeImage,
                'onclick': 'window.audioAPI.clickEpisode(this)',
            };

            // NOTE: show just episodes of the playlist saved podcast
            for (let j = 0; j < JsonContent[i].podcastList.length; j++) {
                if (NewEpisodesJsonContent[a].channelName !== JsonContent[i].podcastList[j]) {
                    continue;
                }
                Episodes.push(EpisodeItem);
            }
        }
    }

    return Episodes;
}
module.exports.getEpisodesInPlayist = getEpisodesInPlayist;
