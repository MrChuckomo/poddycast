'use strict';

const fs = require('fs');
const nav = require('../domain/nav');
const animation = require('../domain/animation.js');
const global = require('./helper_global');
const navigation = require('./helper_navigation');

// ---------------------------------------------------------------------------------------------------------------------
// RIGHT COLUMN
// ---------------------------------------------------------------------------------------------------------------------

function unsubscribeListElement(_Self) {
    let ListElement = _Self.parentElement.parentElement;
    let PodcastName = ListElement.getElementsByClassName('podcast-entry-header')[0].getElementsByClassName('podcast-entry-title')[0].innerHTML;
    let FeedUrl = ListElement.getElementsByClassName('podcast-entry-header')[0].getAttribute('feedUrl');

    // NOTE: Remove optically

    ListElement.parentElement.removeChild(ListElement);

    // NOTE: Remove from files

    removeFromFile(global.newEpisodesSaveFilePath, 'channelName', PodcastName, false);
    removeFromFile(global.saveFilePath, 'feedUrl', FeedUrl, true);

    navigation.setItemCounts();
}
module.exports.unsubscribeListElement = unsubscribeListElement;

function unsubscribeContextMenu(_PodcastName, _FeedUrl) {
    // NOTE: Support context menu unsubscribe

    removeFromFile(global.newEpisodesSaveFilePath, 'channelName', _PodcastName, false);
    removeFromFile(global.saveFilePath, 'feedUrl', _FeedUrl, true);

    nav.selectMenuItem('menu-favorites');
    nav.showFavorites();
    navigation.setItemCounts();
}
module.exports.unsubscribeContextMenu = unsubscribeContextMenu;

function removeFromFile(_File, _ContentReference, _Value, _Break) {
    if (fs.readFileSync(_File, 'utf-8') !== '') {
        let JsonContent = JSON.parse(fs.readFileSync(_File, 'utf-8'));

        for (let i = JsonContent.length - 1; i >= 0 ; i--) {
            if (_Value === JsonContent[i][_ContentReference]) {
                JsonContent.splice(i, 1);

                if (_Break) {
                    break;
                }
            }
        }

        fs.writeFileSync(_File, JSON.stringify(JsonContent));
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// PODCAST ENTRY
// ---------------------------------------------------------------------------------------------------------------------

function getPodcastElement(_Class, _Artwork, _Subtitle, _Title, _IconElement, _TailElement, _HeaderLayout) {
    let ListElement = document.createElement('li');
    let HeaderElement = document.createElement('div');
    let ActionsElement = document.createElement('div');
    let BodyElement = document.createElement('div');

    let TitleElement = document.createElement('div');
    let SubtitleElement = document.createElement('div');
    let ImageElement = document.createElement('img');
    let TailElement = document.createElement('div');

    if (_HeaderLayout === null || _HeaderLayout === undefined) {
        HeaderElement.classList.add('podcast-entry-header');
    } else {
        HeaderElement.classList.add(_HeaderLayout);
    }

    ActionsElement.classList.add('podcast-entry-actions');
    BodyElement.classList.add('podcast-entry-body');

    ImageElement.src = _Artwork;

    TitleElement.innerHTML = _Title;
    TitleElement.classList.add('podcast-entry-title', 'fw-normal');

    SubtitleElement.innerHTML = _Subtitle;
    SubtitleElement.classList.add('podcast-entry-subtitle');

    TailElement.innerHTML = (_TailElement === undefined) ? '' : _TailElement;
    TailElement.classList.add('podcast-entry-tail');

    ListElement.classList.add('podcast-entry');

    if (_Class !== null) {
        ListElement.classList.remove('podcast-entry'); ListElement.classList.add(_Class);
    }
    if (_IconElement !== undefined) {
        ActionsElement.innerHTML = _IconElement;
    }
    if (_Artwork !== null) {
        HeaderElement.append(ImageElement);
    }
    if (_Subtitle !== null) {
        HeaderElement.append(SubtitleElement);
    }

    HeaderElement.append(TitleElement);
    HeaderElement.append(TailElement);

    ListElement.append(HeaderElement);
    ListElement.append(ActionsElement);
    ListElement.append(BodyElement);

    return ListElement;
}
module.exports.getPodcastElement = getPodcastElement;

function getStatisticsElement(_Class, _Title, _Value) {
    let ListElement = document.createElement('li');
    let Title = document.createElement('div');
    let Value = document.createElement('div');

    Title.innerHTML = _Title;
    Title.classList.add('statistics-entry-title');

    if (_Value !== null) {
        Value.innerHTML = _Value;
        Value.classList.add('statistics-entry-value');
    }

    ListElement.classList.add(_Class);
    ListElement.append(Title);

    if (_Value !== null) {
        ListElement.append(Value);
    }

    return ListElement;
}
module.exports.getStatisticsElement = getStatisticsElement;

/**
 * Delete an episode list item.
 * @param {DOMElement} _Self The reference object, usually the deleteicon itself
 * @param {number} _ParentLevel Control different hierarchy level (for differnt UI-layouts)
 */
function deleteEntryWithIcon(_Self, _ParentLevel) {
    let ListItem = _Self.parentElement.parentElement;

    switch (_ParentLevel) {
        case 3:
            ListItem = _Self.parentElement.parentElement.parentElement;
            break;
        default:
            ListItem = _Self.parentElement.parentElement;
            break;
    }

    animation.playListDeleteAnimation(ListItem);

    setTimeout(function () {
        deleteEntry(ListItem);
    }, 500);
}
module.exports.deleteEntryWithIcon = deleteEntryWithIcon;

function deleteEntry(_ListElement) {
    if (global.fileExistsAndIsNotEmpty(global.newEpisodesSaveFilePath)) {
        // NOTE: Remove optically

        deleteFromListView(_ListElement);

        // NOTE: Remove from JSON file and overwrite the file

        deleteFromFile(_ListElement.getAttribute('url'));

        navigation.setItemCounts();
    }
}

function deleteFromListView(_ListElement) {
    _ListElement.parentElement.removeChild(_ListElement);
}
module.exports.deleteFromListView = deleteFromListView;

function deleteFromFile(_FeedUrl) {
    let JsonContent = JSON.parse(fs.readFileSync(global.newEpisodesSaveFilePath, 'utf-8'));

    for (let i = 0; i < JsonContent.length; i++) {
        if (_FeedUrl === JsonContent[i].episodeUrl) {
            let Feed = {
                'channelName': JsonContent[i].channelName,
                'episodeTitle': JsonContent[i].episodeTitle,
                'episodeUrl': JsonContent[i].episodeUrl,
                'archivedType': 'deleted',
                'date': new Date
            };

            let ArchiveJsonContent = [];

            if (global.fileExistsAndIsNotEmpty(global.archivedFilePath)) {
                ArchiveJsonContent = JSON.parse(fs.readFileSync(global.archivedFilePath, 'utf-8'));
            } else if (global.getPreference('track_history', true)) {
                fs.writeFileSync(global.archivedFilePath, JSON.stringify(ArchiveJsonContent));
            }

            ArchiveJsonContent.push(Feed);

            if (global.getPreference('track_history', true)) {
                fs.writeFileSync(global.archivedFilePath, JSON.stringify(ArchiveJsonContent));
            }

            JsonContent.splice(i, 1);
            break;
        }
    }

    fs.writeFileSync(global.newEpisodesSaveFilePath, JSON.stringify(JsonContent));
}
module.exports.deleteFromFile = deleteFromFile;

function clearHistory() {
    fs.writeFileSync(global.archivedFilePath, JSON.stringify([]));
}
module.exports.clearHistory = clearHistory;

// ---------------------------------------------------------------------------------------------------------------------
// Sort And Filter
// ---------------------------------------------------------------------------------------------------------------------

function sortByName(_Json) {
    let SortArray = [];
    let SortJson = [];

    for (let i = 0; i < _Json.length; i++) {
        SortArray.push(_Json[i].collectionName);
    }

    SortArray.sort();

    for (let i = 0; i < SortArray.length; i++) {
        for (let j = 0; j < _Json.length; j++) {
            if (_Json[j].collectionName === SortArray[i]) {
                SortJson.push(_Json[j]);
                break;
            }
        }
    }

    return SortJson;
}
module.exports.sortByName = sortByName;
