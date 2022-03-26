'use strict';

const fs = require('fs');
const global = require('./helper_global');
const playlist = require('../playlist');
const { gridView, listView } = require('../icons');

// ---------------------------------------------------------------------------------------------------------------------
// LEFT COLUMN
// ---------------------------------------------------------------------------------------------------------------------

function setItemCounts() {
    let NewEpisodesCount = document.getElementById('menu-episodes').getElementsByClassName('menu-count')[0];

    if (global.fileExistsAndIsNotEmpty(global.newEpisodesSaveFilePath)) {
        NewEpisodesCount.innerHTML = JSON.parse(fs.readFileSync(global.newEpisodesSaveFilePath, 'utf-8')).length;
    } else {
        NewEpisodesCount.innerHTML = 0;
    }

    let FavoritesCount = document.getElementById('menu-favorites').getElementsByClassName('menu-count')[0];

    if (global.fileExistsAndIsNotEmpty(global.saveFilePath)) {
        FavoritesCount.innerHTML = JSON.parse(fs.readFileSync(global.saveFilePath, 'utf-8')).length;
    } else {
        FavoritesCount.innerHTML = 0;
    }
}
module.exports.setItemCounts = setItemCounts;

function clearPlaylists() {
    let AllInputFields = document.getElementById('playlists').getElementsByTagName('input');

    for (let i = 0; i < AllInputFields.length; i++) {
        if (!AllInputFields[i].disabled) {
            clearRenameFocus(AllInputFields[i]);
        }
    }
}
module.exports.clearPlaylists = clearPlaylists;

function clearRenameFocus(_Self) {
    if (_Self.value === '') {
        let HeaderName = document.getElementById('content-right-header').getElementsByTagName('h1')[0].innerHTML;

        _Self.value = HeaderName;
    }

    renamePlaylistInline(_Self);
}
module.exports.clearRenameFocus = clearRenameFocus;

function renamePlaylistInline(_Self) {
    if (_Self.value !== null && _Self.value !== '') {
        let HeaderName = document.getElementById('content-right-header').getElementsByTagName('h1')[0].innerHTML;
        let NewName = _Self.value;

        setPlaylistName(HeaderName, NewName);
        playlist.showPlaylistContent(_Self.parentElement);

        _Self.disabled = true;
    }
}
module.exports.renamePlaylistInline = renamePlaylistInline;

function renamePlaylistInEdit(_Self) {
    if (_Self.value !== null && _Self.value !== '') {
        let SelectionName = document.getElementById('playlists').getElementsByClassName('selected')[0].getElementsByTagName('input')[0].value;
        let NewName = _Self.value;

        setPlaylistName(SelectionName, NewName);
        document.getElementById('playlists').getElementsByClassName('selected')[0].getElementsByTagName('input')[0].value = NewName;
        _Self.parentElement.getElementsByTagName('button')[0].setAttribute('onclick', 'navigation.deletePlaylist("' + NewName + '")');
    }
}
module.exports.renamePlaylistInEdit = renamePlaylistInEdit;

function setPlaylistName(_OldName, _NewName) {
    if (global.fileExistsAndIsNotEmpty(global.playlistFilePath)) {
        let JsonContent = JSON.parse(fs.readFileSync(global.playlistFilePath, 'utf-8'));

        for (let i = 0; i < JsonContent.length; i++) {
            if (JsonContent[i].playlistName === _OldName) {
                JsonContent[i].playlistName = _NewName;
                break;
            }
        }

        fs.writeFileSync(global.playlistFilePath, JSON.stringify(JsonContent));
    }
}
module.exports.setPlaylistName = setPlaylistName;

function setGridLayout(_List, _Enable) {
    if (_Enable) {
        _List.classList.add('grid-layout');
    } else {
        _List.classList.remove('grid-layout');
    }
}
module.exports.setGridLayout = setGridLayout;

// ---------------------------------------------------------------------------------------------------------------------
// RIGHT COLUMN
// ---------------------------------------------------------------------------------------------------------------------

function setHeaderViewAction(_Mode) {
    switch (_Mode) {
    case 'list':
        document.getElementById('content-right-header-actions').innerHTML = listView;
        document.getElementById('content-right-header-actions').getElementsByTagName('svg')[0].setAttribute('onclick', 'navigation.toggleList("list")');
        break;

    case 'grid':
        document.getElementById('content-right-header-actions').innerHTML = gridView;
        document.getElementById('content-right-header-actions').getElementsByTagName('svg')[0].setAttribute('onclick', 'navigation.toggleList("grid")');
        break;

    default: document.getElementById('content-right-header-actions').innerHTML = ''; break;
    }
}
module.exports.setHeaderViewAction = setHeaderViewAction;

function toggleList(_View) {
    let List = document.getElementById('list');
    switch (_View) {
    case 'list':
        setGridLayout(List, false);
        setHeaderViewAction('grid');
        break;

    case 'grid':
        setGridLayout(List, true);
        setHeaderViewAction('list');
        break;

    default: break;
    }
}
module.exports.toggleList = toggleList;

// ---------------------------------------------------------------------------------------------------------------------
// MENU & PLAYLISTS
// ---------------------------------------------------------------------------------------------------------------------

function clearMenuSelection() {
    let Menu = document.getElementById('menu');
    let ListItems = Menu.getElementsByTagName('li');
    let Playlists = document.getElementById('playlists').getElementsByTagName('li');

    for (let i = 0; i < ListItems.length; i++) {
        ListItems[i].classList.remove('selected');
    }

    for (let i = 0; i < Playlists.length; i++) {
        Playlists[i].classList.remove('selected');
    }
}
module.exports.clearMenuSelection = clearMenuSelection;

function dragToPlaylist(_PlaylistName, _PodcastName) {
    addToPlaylist(_PlaylistName, _PodcastName);
}
module.exports.dragToPlaylist = dragToPlaylist;

function addToPlaylist(_PlaylistName, _PodcastName) {
    let JsonContent = JSON.parse(fs.readFileSync(global.playlistFilePath, 'utf-8'));

    for (let i = 0; i < JsonContent.length; i++) {
        if (JsonContent[i].playlistName === _PlaylistName) {
            let PodcastList = JsonContent[i].podcastList;

            if (!global.isAlreadyInPlaylist(_PlaylistName, _PodcastName)) {
                PodcastList.push(_PodcastName);
            }
            break;
        }
    }

    fs.writeFileSync(global.playlistFilePath, JSON.stringify(JsonContent));
}
module.exports.addToPlaylist = addToPlaylist;

function removeFromPlaylist(_PlaylistName, _PodcastName) {
    let JsonContent = JSON.parse(fs.readFileSync(global.playlistFilePath, 'utf-8'));

    for (let i = 0; i < JsonContent.length; i++) {
        if (JsonContent[i].playlistName === _PlaylistName) {
            let PodcastList = JsonContent[i].podcastList;

            if (global.isAlreadyInPlaylist(_PlaylistName, _PodcastName)) {
                for (let j = PodcastList.length - 1; j >= 0 ; j--) {
                    if(PodcastList[j] === _PodcastName) {
                        PodcastList.splice(j, 1);
                    }
                }
            }

            break;
        }
    }

    fs.writeFileSync(global.playlistFilePath, JSON.stringify(JsonContent));
}
module.exports.removeFromPlaylist = removeFromPlaylist;

function deletePlaylist(_PlaylistName) {
    let JsonContent = JSON.parse(fs.readFileSync(global.playlistFilePath, 'utf-8'));

    for (let i = 0; i < JsonContent.length; i++) {
        if (_PlaylistName === JsonContent[i].playlistName) {
            JsonContent.splice(i, 1);
            break;
        }
    }

    fs.writeFileSync(global.playlistFilePath, JSON.stringify(JsonContent));

    // TODO: clean remove
    // TODO: do not simply reload the whole app

    location.reload();
}
module.exports.deletePlaylist = deletePlaylist;
