'use strict';

const fs = require('fs');
const global = require('./helper_global');
const entries = require('./helper_entries');
const { Podcast } = require('../classes/podcast');
const { Episode } = require('../classes/episode');

let podcasts = []

function getPodcasts(forceReload = false) {
    if ((forceReload || podcasts.length === 0) && global.fileExistsAndIsNotEmpty(global.saveFilePath)) {
        let jsonContent = JSON.parse(fs.readFileSync(global.saveFilePath, 'utf-8'));
        jsonContent = entries.sortByName(jsonContent);

        jsonContent.forEach(entry => {
            let podcast = new Podcast(entry);
            podcasts.push(podcast);
        })
    }

    return podcasts;
}
module.exports.getPodcasts = getPodcasts;

function addPodcast(podcast) {
    const index = podcasts.indexOf(podcast);
    // only add the podcast if it doesn't exist in the array
    if (index === -1) {
        podcasts.push(podcast);
    }
    // return whether the requested podcast was added
    return index === -1;
}
module.exports.addPodcast = addPodcast;

function removePodcast(podcast) {
    let index = podcasts.indexOf(podcast);
    if (index !== -1) {
        podcasts.splice(index, 1);
    }
    // return whether the requested podcast was removed
    return index !== -1
}
module.exports.removePodcast = removePodcast;

function savePodcasts() {
    if (podcasts.length !== 0 && global.fileExistsAndIsNotEmpty(global.saveFilePath)) {
        let output = [];
        podcasts.forEach(podcast => {
            output.push(podcast.toJson())
        })

        fs.writeFileSync(global.saveFilePath, JSON.stringify(output));
    }
}
module.exports.savePodcasts = savePodcasts;

function saveNewEpisodes(episodeList) {
    let jsonContent = [];

    if (global.fileExistsAndIsNotEmpty(global.newEpisodesSaveFilePath)) {
        jsonContent = JSON.parse(fs.readFileSync(global.newEpisodesSaveFilePath, 'utf-8'));
    } else {
        fs.writeFileSync(global.newEpisodesSaveFilePath, JSON.stringify(jsonContent));
    }

    episodeList.forEach(episode => {
        if (episode instanceof Episode && !global.isEpisodeAlreadySaved(episode.title)) {
            jsonContent.push(episode.toJSON());
        }
    });

    fs.writeFileSync(global.newEpisodesSaveFilePath, JSON.stringify(jsonContent));
}
module.exports.saveNewEpisodes = saveNewEpisodes;
