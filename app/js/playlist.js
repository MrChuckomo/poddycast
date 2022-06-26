'use strict';

let CContentHelper = require('./helper/content');
let helper = new CContentHelper();

let CPlayer = require('./helper/player');
let player = new CPlayer();
const fs = require('fs');
const global = require('./helper/helper_global');
const navigation = require('./helper/helper_navigation');
const entries = require('./helper/helper_entries');
const dragHandler = require('./drag_handler');
const listItem = require('./list_item');
const { heartFilled, checkBox, checkBoxOutline, infoIcon, deleteIcon } = require('./icons');
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

function createPlaylist(_Self, _Event) {
    if (_Event.code === 'Enter') {
        let NewPlaylist = document.createElement('li');
        NewPlaylist.classList.add('mx-2', 'rounded-3', 'fw-light');
        NewPlaylist.addEventListener('dragenter', dragHandler.handleDragEnter, false);
        NewPlaylist.addEventListener('dragover', dragHandler.handleDragOver, false);
        NewPlaylist.addEventListener('dragleave', dragHandler.handleDragLeave, false);
        NewPlaylist.addEventListener('drop', dragHandler.handleDrop, false);
        NewPlaylist.append(getInputEntry(_Self.value));

        let PlaylistList = document.getElementById('playlists').getElementsByTagName('ul')[0];
        PlaylistList.append(NewPlaylist);

        // TODO
        // setContextMenu(NewPlaylist);

        let Playlist = {
            'playlistName': _Self.value,
            'podcastList': []
        };

        _Self.innerHTML = heartFilled;
        _Self.classList.add('set-favorite');

        let JsonContent = [];

        if (global.fileExistsAndIsNotEmpty(global.playlistFilePath)) {
            JsonContent = JSON.parse(fs.readFileSync(global.playlistFilePath, 'utf-8'));
        } else {
            fs.writeFileSync(global.playlistFilePath, JSON.stringify(JsonContent));
        }

        JsonContent.push(Playlist);

        fs.writeFileSync(global.playlistFilePath, JSON.stringify(JsonContent));

        global.clearTextField(_Self);

    } else if (_Event.code === 'Escape') {
        global.clearTextField(_Self);
    }
}
module.exports.createPlaylist = createPlaylist;

function loadPlaylists() {
    let PlaylistList = document.getElementById('playlists').getElementsByTagName('ul')[0];

    if (global.fileExistsAndIsNotEmpty(global.playlistFilePath)) {
        let JsonContent = JSON.parse(fs.readFileSync(global.playlistFilePath, 'utf-8'));

        for (let i = 0; i < JsonContent.length; i++) {
            let PlaylistEntry = document.createElement('li');
            PlaylistEntry.classList.add('mx-2', 'rounded-3', 'fw-light');
            PlaylistEntry.addEventListener('dragenter', dragHandler.handleDragEnter, false);
            PlaylistEntry.addEventListener('dragover', dragHandler.handleDragOver, false);
            PlaylistEntry.addEventListener('dragleave', dragHandler.handleDragLeave, false);
            PlaylistEntry.addEventListener('drop', dragHandler.handleDrop, false);
            PlaylistEntry.append(getInputEntry(JsonContent[i].playlistName));

            // TODO
            // setContextMenu(PlaylistEntry);

            PlaylistList.append(PlaylistEntry);
        }
    }
}
module.exports.loadPlaylists = loadPlaylists;

/** @private */
// TODO: needs new solution cause of IPC
// function setContextMenu(_Object) {
//     const {remote} = require('electron');
//     const {Menu, MenuItem} = remote;
//     const ContextMenu = new Menu();

//     // NOTE: Access input field inside the playlist item to get the name.

//     ContextMenu.append(new MenuItem({
//         click() {
//             showEditPage(_Object);
//         },
//         label: i18n.__('Edit')
//     }));
//     ContextMenu.append(new MenuItem({type: 'separator'}));
//     ContextMenu.append(new MenuItem({
//         click() {
//             enableRename(_Object);
//         },
//         label: i18n.__('Rename')
//     }));
//     ContextMenu.append(new MenuItem({
//         click() {
//             navigation.deletePlaylist(_Object.getElementsByTagName('input')[0].value);
//         },
//         label: i18n.__('Delete')
//     }));

//     _Object.addEventListener('contextmenu', (_Event) => {
//         _Event.preventDefault();
//         ContextMenu.popup(remote.getCurrentWindow(), { async:true });
//     }, false);
// }

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

    Container.setAttribute('onclick', 'playlist.togglePodcast(this)');
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

// eslint-disable-next-line no-unused-vars
function togglePodcast(_Self) {
    let CheckBox = document.createElement('img');
    CheckBox.innerHTML = checkBox;

    let CheckBoxOutline = document.createElement('img');
    CheckBoxOutline.innerHTML = checkBoxOutline;

    for (let i = 0; i < _Self.classList.length; i++) {
        switch (_Self.classList[i]) {
            case 'check':
                _Self.classList.remove('check');
                _Self.classList.add('uncheck');
                _Self.getElementsByTagName('svg')[0].innerHTML = CheckBoxOutline.getElementsByTagName('svg')[0].innerHTML;
                navigation.removeFromPlaylist(_Self.parentElement.getElementsByClassName('playlist-edit-input')[0].value, _Self.getElementsByTagName('span')[0].innerHTML);

                break;

            case 'uncheck':
                _Self.classList.remove('uncheck');
                _Self.classList.add('check');
                _Self.getElementsByTagName('svg')[0].innerHTML = CheckBox.getElementsByTagName('svg')[0].innerHTML;
                navigation.addToPlaylist(_Self.parentElement.getElementsByClassName('playlist-edit-input')[0].value, _Self.getElementsByTagName('span')[0].innerHTML);

                break;

            default: break;
        }
    }
}
module.exports.togglePodcast = togglePodcast;

// ---------------------------------------------------------------------------------------------------------------------

/** @private */
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
    NameInput.value = PlaylistName;
    NameInput.classList.add('playlist-edit-input', 'rounded-3');

    let DeleteButton = document.createElement('button');
    // DeleteButton.innerHTML = i18n.__('Delete');
    DeleteButton.innerHTML = 'Delete';
    DeleteButton.setAttribute('onclick', 'navigation.deletePlaylist("' + PlaylistName + '")');
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
                        ListElement.setAttribute('onclick', 'window.audioAPI.clickEpisode(this)');

                        // NOTE: show just episodes of the playlist saved podcast

                        for (let j = 0; j < JsonContent[i].podcastList.length; j++) {
                            if (NewEpisodesJsonContent[a].channelName === JsonContent[i].podcastList[j]) {
                                List.append(ListElement);
                                break;
                            }
                        }
                    }
                }
            }

            break;
        }
    }
}
module.exports.showPlaylistContent = showPlaylistContent;
