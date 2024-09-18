'use strict';

let CContentHelper = require('./helper/content');
let CPlayer = require('./helper/player');
const { Episode } = require('./classes/episode');
const global = require('./helper/helper_global');
const navigation = require('./helper/helper_navigation');
const listItem = require('./list_item');
const request = require('./request');
const fs = require('fs');
const { infoIcon, addEpisodeIcon } = require('./icons');
const { ipcRenderer } = require('electron');

let helper = new CContentHelper();
let player = new CPlayer();

/**
 * Read all saved feeds and save latest episodes if applicable.
 * @public
 * @returns void
 */
function readFeeds() {
    // TODO: Save a file for each podcast including all episodes

    // Add animation to notify the user about fetching new episodes
    document.querySelector('#menu-refresh i').classList.add('is-refreshing');

    if (fs.readFileSync(global.saveFilePath, 'utf-8') !== '') {
        let JsonContent = JSON.parse(fs.readFileSync(global.saveFilePath, 'utf-8'));

        let feedUrl = '';
        let feedPromises = [];
        for (let i = 0; i < JsonContent.length; i++) {
            // Do not query episodes if user does not want them in their inbox
            if (!JsonContent[i].addToInbox) {
                continue;
            }
            feedUrl = JsonContent[i].feedUrl;

            feedPromises.push(
                request
                    .requestPodcastFeed(feedUrl, false)
                    .then((result) => {
                        saveLatestEpisodeJson(result);
                    })
                    .catch((error) => {
                        console.error(error);
                    })
            );
        }
        return new Promise((resolve) => {
            Promise.allSettled(feedPromises)
                .finally(() => {
                    // stop refreshing on success or failure
                    // includes minimum delay for user feedback
                    setTimeout(() => {
                        document
                            .querySelector('#menu-refresh i')
                            .classList.remove('is-refreshing');
                    }, 1000);
                    resolve();
                });
        });
    }
}
module.exports.readFeeds = readFeeds;

/**
 * Loads window to show all podcast episodes for a given feed.
 * @public
 * @param {DOM_element} element HTML DOM element being selected
 */
function showAllEpisodes(element) {
    navigation.setGridLayout(document.getElementById('list'), false);

    helper.clearContent();
    navigation.setHeaderViewAction();

    const feedUrl = element.getAttribute('feedurl');
    const podcastName = global.getValueFromFile(global.saveFilePath, 'collectionName', 'feedUrl', feedUrl);

    appendSettingsSection(podcastName, feedUrl);

    request
        .requestPodcastFeed(feedUrl, false)
        .then((result) => {
            displayEpisodesInList(result);
        })
        .catch((error) => {
            console.log(error);
            let alert = document.createElement('div');
            alert.classList.add('alert', 'alert-danger', 'm-3');
            alert.innerHTML = '<i class="bi bi-wifi-off me-2"></i>Unable to fetch data! <b>' + error + '</b>';
            document.getElementById('list').appendChild(alert);
        });
}
module.exports.showAllEpisodes = showAllEpisodes;

/**
 * Podcast settings area at the top of the podcast detail view.
 * @param {string} _PodcastName
 * @param {*} _Feed
 */
function appendSettingsSection(_PodcastName, _Feed) {
    let RightContent = document.getElementById('list');

    let SettingsDiv = document.createElement('div');
    SettingsDiv.classList.add('settings');

    let PodcastImage = document.createElement('img');
    PodcastImage.classList.add('settings-image');

    let podcastName = document.createElement('div');
    podcastName.classList.add('settings-header', 'placeholder-glow');
    podcastName.innerHTML = '<span class="placeholder placeholder-lg col-6"></span>';

    let EpisodeCount = document.createElement('div');
    EpisodeCount.classList.add('settings-count', 'placeholder-glow');
    EpisodeCount.innerHTML = '<span class="placeholder col-1"></span>';

    let MoreElement = document.createElement('div');
    MoreElement.innerHTML = '<i class="bi bi-three-dots"></i>';
    MoreElement.classList.add('settings-unsubscribe', 'btn', 'btn-secondary');

    // NOTE: set context menu
    setPodcastSettingsMenu(MoreElement, _PodcastName, _Feed);

    // NOTE: build layout
    SettingsDiv.append(PodcastImage);
    SettingsDiv.append(podcastName);
    SettingsDiv.append(EpisodeCount);
    SettingsDiv.append(MoreElement);

    RightContent.append(SettingsDiv);
}

/**
 * Podcast-Feed detail page (three-dot)-"more"-button
 * @param {*} _Element
 * @param {*} _PodcastName
 * @param {*} _Feed
 */
function setPodcastSettingsMenu(_Element, _PodcastName, _Feed) {
    const PlaylistMenu = [];

    if (fs.existsSync(global.playlistFilePath) && fs.readFileSync(global.playlistFilePath, 'utf-8') !== '') {
        let JsonContent = JSON.parse(fs.readFileSync(global.playlistFilePath, 'utf-8'));

        for (let i = 0; i < JsonContent.length; i++) {
            let IsInPlaylist = global.isAlreadyInPlaylist(JsonContent[i].playlistName, _PodcastName);

            PlaylistMenu.push({
                checked: IsInPlaylist,
                label: JsonContent[i].playlistName,
                type: 'checkbox'
            });
        }
    }

    _Element.addEventListener('click', (e) => {
        e.preventDefault();
        ipcRenderer.send('show-ctx-menu-podcast', _PodcastName, _Feed, JSON.stringify(PlaylistMenu));
    });
}

/**
 * Connect a podcast with playlist e.g. when you use the seetings menu in
 * the podcast detail view.
 * @param {string} _PodcastName
 * @param {string} _PlaylistName
 */
function addToPlaylist(_PodcastName, _PlaylistName) {
    let JsonContent = JSON.parse(fs.readFileSync(global.playlistFilePath, 'utf-8'));

    for (let i = 0; i < JsonContent.length; i++) {
        if (_PlaylistName === JsonContent[i].playlistName) {
            let PodcastList = JsonContent[i].podcastList;
            let PodcastName = _PodcastName;

            if (global.isAlreadyInPlaylist(JsonContent[i].playlistName, PodcastName)) {
                for (let j = PodcastList.length - 1; j >= 0; j--) {
                    if (PodcastList[j] === PodcastName) {
                        PodcastList.splice(j, 1);
                    }
                }
            } else {
                PodcastList.push(PodcastName);
            }
            break;
        }
    }
    fs.writeFileSync(global.playlistFilePath, JSON.stringify(JsonContent));
}
module.exports.addToPlaylist = addToPlaylist;

/**
 * Displays all podcast episodes in list view.
 * @private
 * @param {JSON} podcastObject Podcast feed in JSON format.
 */
function displayEpisodesInList(podcastObject) {
    const channelName = podcastObject.title;
    const artwork = global.getValueFromFile(global.saveFilePath, 'artworkUrl60', 'collectionName', channelName);
    document.getElementsByClassName('settings-image')[0].src = artwork
        ? global.sanitizeString(artwork)
        : global.sanitizeString(podcastObject.image);
    document.getElementsByClassName('settings-header')[0].innerHTML = global.sanitizeString(channelName);
    document.getElementsByClassName('settings-count')[0].innerHTML = podcastObject.items.length;

    let list = document.getElementById('list');

    podcastObject.items.forEach(episode => {
        let listElement = listItem.buildListItem(new listItem.cListElement(
            [
                listItem.getBoldTextPart(episode.title),
                listItem.getSubTextPart(new Date(episode.published).toLocaleString()),
                listItem.getSubTextPart(episode.duration_formatted),
                listItem.getFlagPart('Done', 'white', '#4CAF50'),
                listItem.getDescriptionPart(infoIcon, episode.description),
                listItem.getIconButtonPart(addEpisodeIcon)
            ],
            '3fr 1fr 1fr 5em 5em 5em'
        ), listItem.eLayout.row);

        if (global.isEpisodeAlreadySaved(episode.title)) {
            listElement.replaceChild(listItem.getIconButtonPart(''), listElement.children[5]);
        }

        if (player.isPlaying(episode.url)) {
            listElement.classList.add('select-episode');
        }

        // NOTE: Set a episode item to "Done" if it is in the History file

        if (global.getValueFromFile(global.archivedFilePath, 'episodeUrl', 'episodeUrl', episode.url) === null) {
            listElement.replaceChild(listItem.getIconButtonPart(''), listElement.children[3]);
        }

        listElement.setAttribute('channel', global.sanitizeString(channelName));
        listElement.setAttribute('title', global.sanitizeString(episode.title));
        listElement.setAttribute('type', episode.type);
        listElement.setAttribute('url', global.sanitizeString(episode.url));
        listElement.setAttribute('length', episode.duration_formatted);
        listElement.setAttribute('duration', episode.duration);
        listElement.setAttribute('description', global.sanitizeString(episode.description));
        listElement.setAttribute('artworkUrl', artwork);
        listElement.setAttribute('episodeImagekUrl', episode.itunes_image);
        listElement.setAttribute('onclick', 'window.audioAPI.clickEpisode(this)');

        list.append(listElement);
    });
}

/**
 * Add episode to user's episode list.
 * @public
 * @param {DOM_element} addEpisodeIconElement HTML DOM element used to add episode.
 */
function addToEpisodes(addEpisodeIconElement) {
    const episodeElement = addEpisodeIconElement.parentElement.parentElement;

    const episode = new Episode(
        episodeElement.getAttribute('channel'),
        episodeElement.getAttribute('title'),
        episodeElement.getAttribute('description'),
        episodeElement.getAttribute('length'),
        episodeElement.getAttribute('type'),
        episodeElement.getAttribute('url'),
        episodeElement.getAttribute('episodeImagekUrl'),
        episodeElement.getAttribute('duration')
    );

    saveEpisode(episode);
    addEpisodeIconElement.remove();
}
module.exports.addToEpisodes = addToEpisodes;

/**
 * Saves the latest episode of a podcast feed to the user's episode list.
 * @private
 * @param {JSON} content Podcast feed in JSON format
 */
function saveLatestEpisodeJson(content) {
    // NOTE: Fetch the new episode only if it is not disabled in the podcast settings
    if (!global.isAddedToInbox(content.link))
        return;

    const storedRecentDate = global.getFeedRecentEpisodeDate(content.link);
    const latestDate = content.items[0].published;

    for (let i = 0; i < content.items.length; i++) {
        const item = content.items[i];
        if (storedRecentDate === null || item.published > storedRecentDate) {
            const episode = new Episode(
                content.title,
                item.title,
                item.description,
                item.duration,
                item.type,
                item.link,
                item.itunes_image,
                item.duration_formatted
            );
            saveEpisode(episode);
            // only process one episode if we don't have a previous one stored
            if (storedRecentDate === null) {
                break;
            }
        } else {
            break;
        }
    }
    global.addRecentEpisode(content.link, latestDate);
}

/**
 * Saves a podcast episode to the new episodes save file.
 * @private
 * @param {Episode} episode Podcast episode class.
 */
function saveEpisode(episode) {
    let JsonContent = [];

    if (fs.existsSync(global.newEpisodesSaveFilePath) && fs.readFileSync(global.newEpisodesSaveFilePath, 'utf-8') !== '') {
        JsonContent = JSON.parse(fs.readFileSync(global.newEpisodesSaveFilePath, 'utf-8'));
    } else {
        fs.writeFileSync(global.newEpisodesSaveFilePath, JSON.stringify(JsonContent));
    }

    if (!global.isEpisodeAlreadySaved(episode.title)) {
        JsonContent.push(episode.toJSON());
    }

    fs.writeFileSync(global.newEpisodesSaveFilePath, JSON.stringify(JsonContent));

    navigation.setItemCounts();
}
