'use strict';

const fs = require('fs');
const { ipcRenderer } = require('electron');
const CContentHelper = require('../helper/content');
const CPlayer = require('../helper/player');
const global = require('../helper/helper_global');
const navigation = require('../helper/helper_navigation');
const entries = require('../helper/helper_entries');
const listItem = require('../interface/list_item');
const mainBody = require('../interface/main_body');
const { brokenLinkIcon, favorite } = require('../interface/icons');
const { handleDragStart } = require('./drag_handler');

const helper = new CContentHelper();
const player = new CPlayer();


function initLocalization() {
    ipcRenderer.invoke('i18n', 'New Episodes').then((title) => translateByClass('new-episodes', title));
    ipcRenderer.invoke('i18n', 'Favorites').then((title) => translateByClass('favorites', title));
    ipcRenderer.invoke('i18n', 'History').then((title) => translateByClass('history', title));
    ipcRenderer.invoke('i18n', 'Playlists').then((title) => translateByClass('playlists', title));
    ipcRenderer.invoke('i18n', 'Refresh').then((title) => translateByClass('refresh', title));
    ipcRenderer.invoke('i18n', 'Statistics').then((title) => translateByClass('statistics', title));
    ipcRenderer.invoke('i18n', 'Search').then((title) => document.getElementsByName('search')[0].placeholder = title);
    ipcRenderer.invoke('i18n', 'New List').then((title) => document.getElementsByName('new_list')[0].placeholder = title);
    ipcRenderer.invoke('i18n', 'No episode selected').then((title) => document.getElementById('content-right-player-title').innerText = title);
}
module.exports.initLocalization = initLocalization;

function translateByClass(className, value) {
    let els = document.getElementsByClassName(className);

    Array.prototype.forEach.call(els, function (el) {
        el.innerHTML = value;
    });
}

function selectMenuItem(_MenuId) {
    let MenuItem = document.getElementById(_MenuId);

    global.clearTextField(document.getElementById('search-input'));
    global.clearTextField(document.getElementById('new_list-input'));

    global.loseFocusTextField('search-input');
    global.loseFocusTextField('new_list-input');

    navigation.clearPlaylists();
    navigation.clearMenuSelection();

    MenuItem.classList.add('selected');

    helper.setHeader(MenuItem.getElementsByTagName('span')[0].innerHTML);
}
module.exports.selectMenuItem = selectMenuItem;

function showNewEpisodes() {
    helper.clearContent();
    navigation.setHeaderViewAction();

    if (fs.existsSync(global.newEpisodesSaveFilePath) && fs.readFileSync(global.newEpisodesSaveFilePath, 'utf-8') !== '') {
        let JsonContent = JSON.parse(fs.readFileSync(global.newEpisodesSaveFilePath, 'utf-8'));
        let List = document.getElementById('list');

        navigation.setGridLayout(List, false);
        mainBody.setDetailPanelSubContent(JsonContent.length + ' ITEMS');

        for (let i = 0; i < JsonContent.length; i++) {
            let Artwork = global.getValueFromFile(global.saveFilePath, 'artworkUrl60', 'collectionName', JsonContent[i].channelName);

            if (global.getValueFromFile(global.saveFilePath, 'artworkUrl100', 'collectionName', JsonContent[i].channelName) !== undefined && global.getValueFromFile(global.saveFilePath, 'artworkUrl100', 'collectionName', JsonContent[i].channelName) !== 'undefined') {
                Artwork = global.getValueFromFile(global.saveFilePath, 'artworkUrl100', 'collectionName', JsonContent[i].channelName);
            }

            const JsonData = [
                {
                    'artwork': Artwork,
                    'name': JsonContent[i].episodeTitle,
                    'channel': JsonContent[i].channelName,
                    'description': JsonContent[i].episodeDescription,
                    'duration': (JsonContent[i].duration === undefined) ? '' : JsonContent[i].duration,
                    'progress': JsonContent[i].progress,
                    'type': JsonContent[i].episodeType,
                    'url': JsonContent[i].episodeUrl,
                    'length': JsonContent[i].episodeLength,
                    'episodeImagekUrl': JsonContent[i].episodeImage,
                    'selected': (player.isPlaying(JsonContent[i].episodeUrl)) ? 'select-episode' : ''
                }
            ];

            List.append(listItem.renderNewEpisodeItem(JsonData));
        }
    }
}
module.exports.showNewEpisodes = showNewEpisodes;

function showFavorites() {
    helper.clearContent();
    navigation.setHeaderViewAction();

    if (fs.existsSync(global.saveFilePath) && fs.readFileSync(global.saveFilePath, 'utf-8') !== '') {
        let JsonContent = JSON.parse(fs.readFileSync(global.saveFilePath, 'utf-8'));
        JsonContent = entries.sortByName(JsonContent);
        let List = document.getElementById('list');

        navigation.setGridLayout(List, true);

        for (let i = 0; i < JsonContent.length; i++) {
            let Artwork = JsonContent[i].artworkUrl60;

            if (JsonContent[i].artworkUrl100 !== undefined && JsonContent[i].artworkUrl100 !== 'undefined') {
                Artwork = JsonContent[i].artworkUrl100;
            }

            let ListElement = entries.getPodcastElement('podcast-entry', Artwork, null, JsonContent[i].collectionName, favorite);

            ListElement.setAttribute('draggable', true);
            ListElement.addEventListener('dragstart', handleDragStart, false);

            let HeaderElement = ListElement.getElementsByClassName('podcast-entry-header')[0];

            HeaderElement.getElementsByTagName('img')[0].setAttribute('draggable', false);
            HeaderElement.setAttribute('feedUrl', JsonContent[i].feedUrl);
            HeaderElement.setAttribute('onclick', 'window.navAPI.clickPodcast(this)');

            // Display feedUrlStatus indicator
            if (JsonContent[i].feedUrlStatus) {
                if (JsonContent[i].feedUrlStatus >= 400) {
                    let brokenLinkIconElement = document.createElement('span');
                    brokenLinkIconElement.innerHTML = brokenLinkIcon;
                    brokenLinkIconElement.classList.add('icon-link-broken-wrapper', 'alert', 'alert-danger');
                    brokenLinkIconElement.setAttribute('title', 'Podcast feed URL is broken.');

                    HeaderElement.append(brokenLinkIconElement);

                    // Display broken URL icon
                    if (HeaderElement.classList && !HeaderElement.classList.contains('podcast-feed-url-broken')) {
                        HeaderElement.classList.add('podcast-feed-url-broken');
                    }

                    if (HeaderElement.classList && HeaderElement.classList.contains('podcast-feed-url-working')) {
                        HeaderElement.classList.remove('podcast-feed-url-working');
                    }
                } else {
                    // Display checked/working icon
                    if (HeaderElement.classList && !HeaderElement.classList.contains('podcast-feed-url-working')) {
                        HeaderElement.classList.add('podcast-feed-url-working');
                    }

                    if (HeaderElement.classList && HeaderElement.classList.contains('podcast-feed-url-broken')) {
                        HeaderElement.classList.remove('podcast-feed-url-broken');
                    }
                }
            }

            List.append(ListElement);
        }
    }
}
module.exports.showFavorites = showFavorites;

function showHistory() {
    helper.clearContent();
    navigation.setHeaderViewAction();

    if (global.fileExistsAndIsNotEmpty(global.archivedFilePath)) {
        let JsonContent = JSON.parse(fs.readFileSync(global.archivedFilePath, 'utf-8'));
        let List = document.getElementById('list');

        navigation.setGridLayout(List, false);

        document.getElementById('content-right-header-actions').innerHTML = '<button id="clear-history-button" type="button" title="Clear History"></button>';
        let ClearButton = document.getElementById('clear-history-button');
        ClearButton.innerHTML = '<i class="bi bi-trash3"></i>';
        ClearButton.className = 'm-3 px-3 rounded-3 fw-light btn btn-outline-danger';
        ClearButton.onclick = () => {
            entries.clearHistory();
            showHistory();
        };

        // NOTE: Show just the last 100 entries in History
        // TODO: The can be loaded after user interaction

        let Count = ((JsonContent.length <= 100) ? JsonContent.length : 100);

        for (let i = JsonContent.length - Count; i < JsonContent.length; i++) {
            let ChannelName = JsonContent[i].channelName;
            let EpisodeTitle = JsonContent[i].episodeTitle;
            let Artwork = global.getValueFromFile(global.saveFilePath, 'artworkUrl60', 'collectionName', ChannelName);

            if (global.getValueFromFile(global.saveFilePath, 'artworkUrl100', 'collectionName', ChannelName) !== undefined && global.getValueFromFile(global.saveFilePath, 'artworkUrl100', 'collectionName', ChannelName) !== 'undefined') {
                Artwork = global.getValueFromFile(global.saveFilePath, 'artworkUrl100', 'collectionName', ChannelName);
            }

            if (Artwork !== null) {
                let DateTime = new Date(JsonContent[i].date);
                let ListElement = listItem.buildListItem(new listItem.cListElement (
                    [
                        listItem.getImagePart(Artwork),
                        listItem.getBoldTextPart(EpisodeTitle),
                        listItem.getSubTextPart(DateTime.toLocaleString())
                    ],
                    '5em 3fr 1fr'
                ), listItem.eLayout.row);

                List.insertBefore(ListElement, List.childNodes[0]);
            }
        }
    }
}
module.exports.showHistory = showHistory;

function showStatistics() {
    helper.clearContent();
    navigation.setHeaderViewAction();

    let JsonContent = null;
    let List = document.getElementById('list');

    navigation.setGridLayout(List, false);

    List.append(entries.getStatisticsElement('statistics-header', 'Podcasts', null));

    ipcRenderer.invoke('i18n', 'Favorite Podcasts').then((title) => {
        if (global.fileExistsAndIsNotEmpty(global.saveFilePath)) {
            JsonContent = JSON.parse(fs.readFileSync(global.saveFilePath, 'utf-8'));
            List.append(entries.getStatisticsElement('statistics-entry', title, JsonContent.length));
        } else {
            List.append(entries.getStatisticsElement('statistics-entry', title, 0));
        }
    });

    ipcRenderer.invoke('i18n', 'Last Podcast').then((title) => {
        if (global.fileExistsAndIsNotEmpty(global.archivedFilePath)) {
            JsonContent = JSON.parse(fs.readFileSync(global.archivedFilePath, 'utf-8'));
            List.append(entries.getStatisticsElement('statistics-entry', title, JsonContent[JsonContent.length - 1].channelName));
        } else {
            List.append(entries.getStatisticsElement('statistics-entry', title, 'None'));
        }
    });

    ipcRenderer.invoke('i18n', 'Episodes').then((title) => {
        List.append(entries.getStatisticsElement('statistics-header', title, null));
    });

    ipcRenderer.invoke('i18n', 'History Items').then((title) => {
        if (global.fileExistsAndIsNotEmpty(global.archivedFilePath)) {
            List.append(entries.getStatisticsElement('statistics-entry', title, JsonContent.length));
        } else {
            List.append(entries.getStatisticsElement('statistics-entry', title, 0));
        }
    });

    ipcRenderer.invoke('i18n', 'New Episodes').then((title) => {
        if (global.fileExistsAndIsNotEmpty(global.newEpisodesSaveFilePath)) {
            JsonContent = JSON.parse(fs.readFileSync(global.newEpisodesSaveFilePath, 'utf-8'));
            List.append(entries.getStatisticsElement('statistics-entry', title, JsonContent.length));
        } else {
            List.append(entries.getStatisticsElement('statistics-entry', title, 0));
        }
    });

    ipcRenderer.invoke('i18n', 'Playlists').then((title) => {
        List.append(entries.getStatisticsElement('statistics-header', title, null));
    });

    ipcRenderer.invoke('i18n', 'Playlists').then((title) => {
        if (global.fileExistsAndIsNotEmpty(global.playlistFilePath)) {
            JsonContent = JSON.parse(fs.readFileSync(global.playlistFilePath, 'utf-8'));
            List.append(entries.getStatisticsElement('statistics-entry', title, JsonContent.length));
        } else {
            List.append(entries.getStatisticsElement('statistics-entry', title, 0));
        }
    });
}
module.exports.showStatistics = showStatistics;
