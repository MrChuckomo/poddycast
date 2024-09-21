'use strict';

const fs = require('fs');
const { ipcRenderer } = require('electron');
const global = require('../helper/helper_global');
const navigation = require('../helper/helper_navigation');
const entries = require('../helper/helper_entries');
const dragHandler = require('./drag_handler');
const listItem = require('../interface/list_item');
const mainBody = require('../interface/main_body');
const { checkBox, checkBoxOutline, infoIcon, deleteIcon } = require('../interface/icons');
const { loadAllPlaylists } = require('../classes/playlist');
const CContentHelper = require('../helper/content');

let helper = new CContentHelper();
let CPlayer = require('../helper/player');
let player = new CPlayer();
// const i18n = window.i18n;

/** @private */
function getInputEntry(_Name) {
    let InputItem = document.createElement('input');

    InputItem.value = _Name;
    InputItem.type = 'text';
    InputItem.disabled = true;

    return InputItem;
}

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Handle creation of a new playlist.
 * @param {str} _Value coming from the input
 * @param {str} _KeyCode coming from the keyboard event
 */
function createPlaylist(_Value, _KeyCode) {
    let newListInput = document.getElementById('new_list-input');

    if (_KeyCode === 'Enter') {
        let NewPlaylist = document.createElement('li');
        NewPlaylist.id = 'playlist-' + _Value.toLowerCase().replaceAll(' ', '-');
        NewPlaylist.classList.add('mx-2', 'rounded-3', 'fw-light');
        NewPlaylist.addEventListener('dragenter', dragHandler.handleDragEnter, false);
        NewPlaylist.addEventListener('dragover', dragHandler.handleDragOver, false);
        NewPlaylist.addEventListener('dragleave', dragHandler.handleDragLeave, false);
        NewPlaylist.addEventListener('drop', dragHandler.handleDrop, false);
        NewPlaylist.append(getInputEntry(_Value));

        let PlaylistList = document.getElementById('playlists').getElementsByTagName('ul')[0];
        PlaylistList.append(NewPlaylist);

        setContextMenu(NewPlaylist);

        let Playlist = {
            'playlistName': _Value,
            'podcastList': []
        };

        let JsonContent = [];

        if (global.fileExistsAndIsNotEmpty(global.playlistFilePath)) {
            JsonContent = JSON.parse(fs.readFileSync(global.playlistFilePath, 'utf-8'));
        } else {
            fs.writeFileSync(global.playlistFilePath, JSON.stringify(JsonContent));
        }

        JsonContent.push(Playlist);

        fs.writeFileSync(global.playlistFilePath, JSON.stringify(JsonContent));

        global.clearTextField(newListInput);

    } else if (_KeyCode === 'Escape') {
        global.clearTextField(newListInput);
    }
}
module.exports.createPlaylist = createPlaylist;

/**
 * "Add"-button click handler to create a new playlist.
 */
function onPlaylistButtonClicked() {
    let inputField = document.getElementById('new_list-input');
    if (inputField.value === '') {
        inputField.focus();
    } else {
        // simulated Enter event
        createPlaylist(inputField.value, 'Enter');
    }
}
module.exports.onPlaylistButtonClicked = onPlaylistButtonClicked;

/**
 * Left panel playlist.
 * Item loading and DOM element builder.
 */
function loadPlaylists() {
    let allPlaylists = loadAllPlaylists();
    let ListOfPlaylists = document.getElementById('playlists').getElementsByTagName('ul')[0];

    allPlaylists.forEach((playlist) => {
        let PlaylistDomElement = document.createElement('li');
        PlaylistDomElement.id = playlist.id;
        PlaylistDomElement.classList.add('mx-2', 'rounded-3', 'fw-light');
        PlaylistDomElement.addEventListener('dragenter', dragHandler.handleDragEnter, false);
        PlaylistDomElement.addEventListener('dragover', dragHandler.handleDragOver, false);
        PlaylistDomElement.addEventListener('dragleave', dragHandler.handleDragLeave, false);
        PlaylistDomElement.addEventListener('drop', dragHandler.handleDrop, false);
        PlaylistDomElement.append(getInputEntry(playlist.playlistName));
        PlaylistDomElement.setAttribute('onclick', 'window.playlistAPI.clickItem(this);');
        setContextMenu(PlaylistDomElement, playlist.playlistName);
        ListOfPlaylists.append(PlaylistDomElement);
    });
}
module.exports.loadPlaylists = loadPlaylists;

/** @private */
function setContextMenu(_Element) {
    _Element.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        ipcRenderer.send('show-ctx-menu-playlist', _Element.id);
    });
}

// ---------------------------------------------------------------------------------------------------------------------

function enableRename(_Self) {
    let InputField = _Self.getElementsByTagName('input')[0];

    showPlaylistContent(_Self);

    InputField.disabled = false;
    InputField.focus();
    InputField.select();
}
module.exports.enableRename = enableRename;

function renamePlaylist(_Self, _KeyCode) {
    if (_KeyCode === 'Enter') {
        if (_Self.classList[0] === 'playlist-edit-input') {
            navigation.renamePlaylistInEdit(_Self);
        } else {
            navigation.renamePlaylistInline(_Self);
        }
    }
}
module.exports.renamePlaylist = renamePlaylist;

/** @deprecated */
// eslint-disable-next-line no-unused-vars
function getPlaylist(_Name) {
    // TODO: load podcasts associated with this playlist
}

/** @private */
function isInPlaylist(_PlaylistName, _PodcastName) {
    let Result = false;
    let JsonContent = JSON.parse(fs.readFileSync(global.playlistFilePath, 'utf-8'));

    for (let i = 0; i < JsonContent.length; i++) {
        if (_PlaylistName === JsonContent[i].playlistName) {
            for (let j = 0; j < JsonContent[i].podcastList.length; j++) {
                if (JsonContent[i].podcastList[j] === _PodcastName) {
                    Result = true;
                    break;
                }
            }
        }
    }

    return Result;
}

/** @private */
function getPodcastEditItem(_Name, _Artwork, _IsSet) {
    let Container = document.createElement('li');
    let CheckBox = ((_IsSet) ? checkBox : checkBoxOutline);
    let Artwork = document.createElement('img');
    let Name = document.createElement('span');

    // Artwork.src = _Artwork
    Name.innerHTML = _Name;

    Container.setAttribute('onclick', 'window.playlistAPI.connectPodcast(this)');
    Container.classList.add('podcast-edit-entry');
    Container.innerHTML = CheckBox;
    Container.append(Artwork);
    Container.append(Name);

    if (_IsSet) {
        Container.classList.add('check');
    } else {
        Container.classList.add('uncheck');
    }

    return Container;
}

/**
 * Action executed if you click on a podcast in the playlist edit page.
 * @param {Node} _Self
 */
function togglePodcast(_Self) {
    const currentCheckbox = _Self.getElementsByTagName('i')[0];
    const checkBoxOutlineNode = new DOMParser().parseFromString(checkBoxOutline, 'text/html').body.firstChild;
    const checkboxNode = new DOMParser().parseFromString(checkBox, 'text/html').body.firstChild;

    for (let i = 0; i < _Self.classList.length; i++) {
        switch (_Self.classList[i]) {
            case 'check':
                _Self.classList.remove('check');
                _Self.classList.add('uncheck');
                currentCheckbox.parentNode.replaceChild(checkBoxOutlineNode, currentCheckbox);
                navigation.removeFromPlaylist(
                    _Self.parentElement.getElementsByClassName('playlist-edit-input')[0].value,
                    _Self.getElementsByTagName('span')[0].innerHTML
                );
                break;

            case 'uncheck':
                _Self.classList.remove('uncheck');
                _Self.classList.add('check');
                currentCheckbox.parentNode.replaceChild(checkboxNode, currentCheckbox);
                navigation.addToPlaylist(
                    _Self.parentElement.getElementsByClassName('playlist-edit-input')[0].value,
                    _Self.getElementsByTagName('span')[0].innerHTML
                );
                break;

            default: break;
        }
    }
}
module.exports.togglePodcast = togglePodcast;

// ---------------------------------------------------------------------------------------------------------------------

function showEditPage(_Self) {
    let PlaylistName = _Self.getElementsByTagName('input')[0].value;
    let List = document.getElementById('list');

    navigation.setGridLayout(List, false);
    helper.clearContent();
    navigation.setHeaderViewAction();
    navigation.clearMenuSelection();
    global.clearTextField(document.getElementById('search-input'));
    global.clearTextField(document.getElementById('new_list-input'));
    helper.setHeader('Edit Playlist');

    _Self.classList.add('selected');

    let NameInput = document.createElement('input');
    NameInput.id = 'edit-playlist-input';
    NameInput.value = PlaylistName;
    NameInput.classList.add('playlist-edit-input', 'rounded-3');
    NameInput.setAttribute('onkeyup', 'window.playlistAPI.rename(this, event.code)');

    let DeleteButton = document.createElement('button');
    ipcRenderer.invoke('i18n', 'Delete').then((title) => DeleteButton.innerHTML = title);
    DeleteButton.setAttribute('onclick', 'window.playlistAPI.delete("' + PlaylistName + '")');
    DeleteButton.classList.add('btn', 'btn-danger', 'rounded-3');

    let HeaderSection = document.createElement('div');
    HeaderSection.classList.add('edit-header');
    HeaderSection.append(NameInput);
    HeaderSection.append(DeleteButton);

    List.append(HeaderSection);
    List.append(entries.getStatisticsElement('statistics-header', 'Linked Podcasts', null));

    let JsonContent = JSON.parse(fs.readFileSync(global.saveFilePath, 'utf-8'));

    JsonContent = entries.sortByName(JsonContent);

    for (let i = 0; i < JsonContent.length; i++) {
        List.append(getPodcastEditItem(JsonContent[i].collectionName, JsonContent[i].artworkUrl30, isInPlaylist(PlaylistName, JsonContent[i].collectionName)));
    }
}
module.exports.showEditPage = showEditPage;

/**
 * TODO: Replace with new CPlaylist class
 * Load the actual playlist-detail view.
 * Show all episodes inside the playlist.
 * @param {this} _Self
 */
function showPlaylistContent(_Self) {
    let PlaylistName = _Self.getElementsByTagName('input')[0].value;

    helper.clearContent();
    navigation.setHeaderViewAction();
    navigation.clearMenuSelection();
    global.clearTextField(document.getElementById('search-input'));
    global.clearTextField(document.getElementById('new_list-input'));

    // TODO: header can be a input field as well for playlists
    // TODO: allow inline editing for playlist header

    helper.setHeader(PlaylistName);

    _Self.classList.add('selected');

    let JsonContent = JSON.parse(fs.readFileSync(global.playlistFilePath, 'utf-8'));
    let episodeCount = 0;

    for (let i = 0; i < JsonContent.length; i++) {
        // if (_Self.innerHTML === JsonContent[i].playlistName)
        if (PlaylistName === JsonContent[i].playlistName) {
            if (global.fileExistsAndIsNotEmpty(global.newEpisodesSaveFilePath)) {
                let NewEpisodesJsonContent = JSON.parse(fs.readFileSync(global.newEpisodesSaveFilePath, 'utf-8'));
                let List = document.getElementById('list');

                navigation.setGridLayout(List, false);

                for (let a = 0; a < NewEpisodesJsonContent.length; a++) {
                    let Artwork = global.getValueFromFile(global.saveFilePath, 'artworkUrl60', 'collectionName', NewEpisodesJsonContent[a].channelName);

                    if (global.getValueFromFile(global.saveFilePath, 'artworkUrl100', 'collectionName', NewEpisodesJsonContent[a].channelName) !== undefined && global.getValueFromFile(global.saveFilePath, 'artworkUrl100', 'collectionName', NewEpisodesJsonContent[a].channelName) !== 'undefined') {
                        Artwork = global.getValueFromFile(global.saveFilePath, 'artworkUrl100', 'collectionName', NewEpisodesJsonContent[a].channelName);
                    }

                    if (Artwork !== null) {
                        let ListElement = listItem.buildListItem(new listItem.cListElement (
                            [
                                listItem.getImagePart(Artwork),
                                listItem.getBoldTextPart(NewEpisodesJsonContent[a].episodeTitle),
                                listItem.getSubTextPart((NewEpisodesJsonContent[a].duration === undefined) ? '' : NewEpisodesJsonContent[a].duration),
                                listItem.getTextPart(NewEpisodesJsonContent[a].channelName),
                                listItem.getDescriptionPart(infoIcon, NewEpisodesJsonContent[a].EpisodeDescription),
                                listItem.getIconButtonPart(deleteIcon)
                            ],
                            '5em 1fr 6em 1fr 5em 5em'
                        ), listItem.eLayout.row);

                        if (player.isPlaying(NewEpisodesJsonContent[a].episodeUrl)) {
                            ListElement.classList.add('select-episode');
                        }

                        ListElement.setAttribute('channel', NewEpisodesJsonContent[a].channelName);
                        ListElement.setAttribute('title', NewEpisodesJsonContent[a].episodeTitle);
                        ListElement.setAttribute('type', NewEpisodesJsonContent[a].episodeType);
                        ListElement.setAttribute('url', NewEpisodesJsonContent[a].episodeUrl);
                        ListElement.setAttribute('length', NewEpisodesJsonContent[a].episodeLength);
                        ListElement.setAttribute('artworkUrl', Artwork);
                        ListElement.setAttribute('episodeImagekUrl', NewEpisodesJsonContent[a].episodeImage);
                        ListElement.setAttribute('onclick', 'window.audioAPI.clickEpisode(this)');

                        // NOTE: show just episodes of the playlist saved podcast

                        for (let j = 0; j < JsonContent[i].podcastList.length; j++) {
                            if (NewEpisodesJsonContent[a].channelName === JsonContent[i].podcastList[j]) {
                                List.append(ListElement);
                                episodeCount ++;
                                break;
                            }
                        }
                    }
                }
            }

            break;
        }
    }

    mainBody.setDetailPanelSubContent(episodeCount + ' ITEMS');
}
module.exports.showPlaylistContent = showPlaylistContent;
