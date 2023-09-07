'use strict';

const fs = require('fs');
const os = require('os');
const darkMode = require('../dark_mode');

// ---------------------------------------------------------------------------------------------------------------------
// GLOBAL
// ---------------------------------------------------------------------------------------------------------------------

const saveDirPath = os.homedir() + '/poddycast-data';
const saveFilePath = saveDirPath + '/poddycast-favorite_podcasts.json';
const newEpisodesSaveFilePath = saveDirPath + '/poddycast-new_episodes.json';
const archivedFilePath = saveDirPath + '/poddycast-archived_episodes.json';
const playlistFilePath = saveDirPath + '/poddycast-playlists.json';
const settingsFilePath = saveDirPath + '/poddycast-podcast_settings.json';
const preferencesFilePath = saveDirPath + '/poddycast-app_preferences.json';
const recentEpisodePath = saveDirPath + '/poddycast-recent_episodes.json';

module.exports.saveDirPath = saveDirPath;
module.exports.saveFilePath = saveFilePath;
module.exports.newEpisodesSaveFilePath = newEpisodesSaveFilePath;
module.exports.archivedFilePath = archivedFilePath;
module.exports.playlistFilePath = playlistFilePath;
module.exports.settingsFilePath = settingsFilePath;
module.exports.preferencesFilePath = preferencesFilePath;
module.exports.recentEpisodePath = recentEpisodePath;

module.exports.isWindows = process.platform === 'win32';
module.exports.isDarwin = process.platform === 'darwin';
module.exports.isLinux = process.platform === 'linux';

function init() {
    if (!fs.existsSync(saveDirPath)) {
        fs.mkdirSync(saveDirPath);
    }

    if (!fs.existsSync(saveFilePath)) {
        fs.openSync(saveFilePath, 'w');
    }

    if (!fs.existsSync(recentEpisodePath)) {
        fs.openSync(recentEpisodePath, 'w');
    }

    if (!fs.existsSync(newEpisodesSaveFilePath)) {
        fs.openSync(newEpisodesSaveFilePath, 'w');
    }

    if (!fs.existsSync(archivedFilePath)) {
        fs.openSync(archivedFilePath, 'w');
    }

    if (!fs.existsSync(playlistFilePath)) {
        fs.openSync(playlistFilePath, 'w');
    }

    // check if user has old settings file
    if (fs.existsSync(settingsFilePath)) {
        upgradeSettingsFile();
    }

    if (!fs.existsSync(preferencesFilePath)) {
        fs.openSync(preferencesFilePath, 'w');

        setPreference('darkmode', false);
        setPreference('minimize', false);
        setPreference('proxymode', false);
        setPreference('playspeed', 1.0);
        setPreference('volume', 0.75);
    }

    darkMode.initDarkMode();

    document.getElementById('volume').value = getPreference('volume');
    document.getElementById('volume').dispatchEvent(new Event('input'));
    document.querySelector('#content-right-player-speed-indicator').innerHTML = getPreference('playspeed').toFixed(1) + 'x';
    document.getElementById('player').playbackRate = parseFloat(getPreference('playspeed'));
    document.getElementById('player').defaultPlaybackRate = parseFloat(getPreference('playspeed'));
}
module.exports.init = init;

function fileExistsAndIsNotEmpty(filePath) {
    return fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf-8') !== '';
}
module.exports.fileExistsAndIsNotEmpty = fileExistsAndIsNotEmpty;

function sanitizeString(input) {
    // https://owasp.org/www-community/xss-filter-evasion-cheatsheet
    // TODO: Whitelist malicious code
    // TODO: remove and cleanup code (using regex)
    // TODO: return clean string

    // const patterns = [
    //     /img/im,
    //     /src=/im,
    //     /sript/im
    // ]

    // for (let index = 0; index < patterns.length; index++) {
    //     const pattern = patterns[index];

    //     console.log(input.match(pattern))
    // }

    let temp = document.createElement('div');
    temp.innerHTML = input;
    let sanitized = temp.textContent || temp.innerText;

    return sanitized;
}
module.exports.sanitizeString = sanitizeString;

function upgradeSettingsFile() {
    let oldFilePath = settingsFilePath;
    let newFilePath = saveFilePath;

    // sync addToInbox values from old settings file
    if (fileExistsAndIsNotEmpty(oldFilePath)) {
        let JsonContent = JSON.parse(fs.readFileSync(oldFilePath, 'utf-8'));

        for (let i = 0; i < JsonContent.length; i++) {
            setIsAddedToInbox(JsonContent[i].feedUrl, JsonContent[i].addToInbox);
        }
    }

    // create addToInbox value to any remaining items in the favorites file
    if (fileExistsAndIsNotEmpty(newFilePath)) {
        let JsonContent = JSON.parse(fs.readFileSync(newFilePath, 'utf-8'));

        for (let i = 0; i < JsonContent.length; i++) {
            // eslint-disable-next-line no-prototype-builtins
            if (!JsonContent[i].hasOwnProperty('addToInbox')) {
                setIsAddedToInbox(JsonContent[i].feedUrl, true);
            }
        }
    }

    // rename old settings file so that it is not processed again in the future
    fs.renameSync(oldFilePath, oldFilePath + '.old');
}

function isAlreadySaved(_FeedUrl) {
    let FeedExists = false;

    if (fs.readFileSync(saveFilePath, 'utf-8') !== '') {
        let JsonContent = JSON.parse(fs.readFileSync(saveFilePath, 'utf-8'));

        for (let i = 0; i < JsonContent.length; i ++) {
            if (JsonContent[i].feedUrl === _FeedUrl) {
                FeedExists = true;
                break;
            }
        }
    }

    return FeedExists;
}
module.exports.isAlreadySaved = isAlreadySaved;

function isEpisodeAlreadySaved(_EpisodeTitle) {
    let FeedExists = false;

    if (fs.readFileSync(newEpisodesSaveFilePath, 'utf-8') !== '') {
        let JsonContent = JSON.parse(fs.readFileSync(newEpisodesSaveFilePath, 'utf-8'));

        for (let i = 0; i < JsonContent.length; i ++) {
            if (JsonContent[i].episodeTitle === _EpisodeTitle) {
                FeedExists = true;
                break;
            }
        }
    }

    return FeedExists;
}
module.exports.isEpisodeAlreadySaved = isEpisodeAlreadySaved;

function getFeedRecentEpisodeDate(feedUrl) {
    if (fileExistsAndIsNotEmpty(recentEpisodePath)) {
        const jsonContent = JSON.parse(fs.readFileSync(recentEpisodePath, 'utf-8'));
        return jsonContent[feedUrl];
    }

    return null;
}
module.exports.getFeedRecentEpisodeDate = getFeedRecentEpisodeDate;

function addRecentEpisode(feedUrl, episodeDate) {
    let jsonContent = {};
    if (fileExistsAndIsNotEmpty(recentEpisodePath)) {
        jsonContent = JSON.parse(fs.readFileSync(recentEpisodePath, 'utf-8'));
    }

    jsonContent[feedUrl] = episodeDate;

    fs.writeFileSync(recentEpisodePath, JSON.stringify(jsonContent));
}
module.exports.addRecentEpisode = addRecentEpisode;

function isAlreadyInPlaylist(_ListName, _PodcastName) {
    let JsonContent = JSON.parse(fs.readFileSync(playlistFilePath, 'utf-8'));
    let Result = false;


    for (let i = 0; i < JsonContent.length; i++) {
        if (JsonContent[i].playlistName === _ListName) {
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
module.exports.isAlreadyInPlaylist = isAlreadyInPlaylist;

function getValueFromFile(_File, _DestinationTag, _ReferenceTag, _Value) {
    let DestinationValue = null;

    if (fileExistsAndIsNotEmpty(_File)) {
        let JsonContent = JSON.parse(fs.readFileSync(_File, 'utf-8'));

        for (let i = 0; i < JsonContent.length; i++) {
            if (JsonContent[i][_ReferenceTag] === _Value) {
                DestinationValue = JsonContent[i][_DestinationTag];
                break;
            }
        }
    }

    return DestinationValue;
}
module.exports.getValueFromFile = getValueFromFile;

function clearTextField(_InputField) {
    _InputField.value = '';
}
module.exports.clearTextField = clearTextField;

function focusTextField(_InputField) {
    document.getElementById(_InputField).focus();
}
module.exports.focusTextField = focusTextField;

function loseFocusTextField(_InputField) {
    document.getElementById(_InputField).blur();
}
module.exports.loseFocusTextField = loseFocusTextField;

function getFullTime(_TimeInSeconds) {
    let FullTime = {};
    let Hours = Math.floor(_TimeInSeconds / 3600);

    _TimeInSeconds = _TimeInSeconds - (Hours * 3600);

    let Minutes = Math.floor(_TimeInSeconds / 60);
    let Seconds = Math.floor(_TimeInSeconds - (Minutes * 60));

    FullTime.hours = Hours;
    FullTime.minutes = Minutes;
    FullTime.seconds = Seconds;

    return FullTime;
}
module.exports.getFullTime = getFullTime;

function parseFeedEpisodeDuration(_Duration) {
    let Time = {};
    let Hours = '0';
    let Minutes = '0';

    if (_Duration.length === 1) {
        Time = getFullTime(_Duration[0] * 60);
        Hours = '0';
        Minutes = Time.hours.toString();
    } else if (_Duration.length === 2) {
        Time = getFullTime(_Duration[0] * 60);
        Hours = Time.hours.toString();
        Minutes = Time.minutes.toString();
    } else {
        Hours = _Duration[0];
        Minutes = _Duration[1];
    }

    Hours = Hours.replace(/^0/, '');
    Minutes = Minutes.replace(/^0/, '');

    Time.hours = ((Hours === '') ? '0' : Hours);
    Time.minutes = Minutes;

    return Time;
}
module.exports.parseFeedEpisodeDuration = parseFeedEpisodeDuration;

// ---------------------------------------------------------------------------------------------------------------------
// SETTINGS
// ---------------------------------------------------------------------------------------------------------------------

function isProxySet() {
    return getPreference('proxy_enabled', false);
}
module.exports.isProxySet = isProxySet;

/**
 * @deprecated No longer needed after merging of settings and favorites files.
 * @param {string} _PodcastName
 * @param {string} _FeedUrl
 */
// eslint-disable-next-line no-unused-vars
function addToSettings(_PodcastName, _FeedUrl) {
    if (fs.existsSync(settingsFilePath)) {
        let SettingsObject =
        {
            'podcastName': _PodcastName,
            'feedUrl': _FeedUrl,
            'addToInbox': true
        };

        let JsonContent = [];

        if (fileExistsAndIsNotEmpty(settingsFilePath)) {
            JsonContent = JSON.parse(fs.readFileSync(settingsFilePath, 'utf-8'));
        } else {
            fs.writeFileSync(settingsFilePath, JSON.stringify(JsonContent));
        }

        if (!isInSettings(_FeedUrl)) {
            JsonContent.push(SettingsObject);
        }

        fs.writeFileSync(settingsFilePath, JSON.stringify(JsonContent));
    }
}

/**
 * @deprecated Replaced with isAddedToInbox to improve usage clarity
 * @param {*} _FeedUrl
 */
// eslint-disable-next-line no-unused-vars
function getSettings(_FeedUrl) {
    let ToInbox = true;

    if (fileExistsAndIsNotEmpty(saveFilePath)) {
        let JsonContent = JSON.parse(fs.readFileSync(saveFilePath, 'utf-8'));

        for (let i = 0; i < JsonContent.length; i++) {
            if (JsonContent[i].feedUrl === _FeedUrl) {
                ToInbox = JsonContent[i].addToInbox;

                break;
            }
        }
    }

    return ToInbox;
}

function isAddedToInbox(_FeedUrl) {
    let ToInbox = true;

    if (fileExistsAndIsNotEmpty(saveFilePath)) {
        let JsonContent = JSON.parse(fs.readFileSync(saveFilePath, 'utf-8'));

        for (let i = 0; i < JsonContent.length; i++) {
            if (JsonContent[i].feedUrl === _FeedUrl) {
                ToInbox = JsonContent[i].addToInbox;
                break;
            }
        }
    }

    return ToInbox;
}
module.exports.isAddedToInbox = isAddedToInbox;

/** @private */
function isInSettings(_FeedUrl) {
    let Result = false;

    if (fileExistsAndIsNotEmpty(saveFilePath)) {
        let JsonContent = JSON.parse(fs.readFileSync(saveFilePath, 'utf-8'));

        for (let i = 0; i < JsonContent.length; i++) {
            if (JsonContent[i].feedUrl === _FeedUrl) {
                Result = true;
                break;
            }
        }
    }

    return Result;
}

/**
 * @deprecated Replaced with setIsAddedToInbox to improve usage clarity
 * @param {*} _FeedUrl
 * @param {*} _ToInbox
 */
// eslint-disable-next-line no-unused-vars
function changeSettings(_FeedUrl, _ToInbox) {
    if (fileExistsAndIsNotEmpty(saveFilePath)) {
        let JsonContent = JSON.parse(fs.readFileSync(saveFilePath, 'utf-8'));

        for (let i = 0; i < JsonContent.length; i++) {
            if (JsonContent[i].feedUrl === _FeedUrl) {
                JsonContent[i].addToInbox = _ToInbox;
                break;
            }
        }

        fs.writeFileSync(saveFilePath, JSON.stringify(JsonContent));
    }
}

function setIsAddedToInbox(_FeedUrl, _ToInbox) {
    if (fileExistsAndIsNotEmpty(saveFilePath)) {
        let JsonContent = JSON.parse(fs.readFileSync(saveFilePath, 'utf-8'));

        for (let i = 0; i < JsonContent.length; i++) {
            if (JsonContent[i].feedUrl === _FeedUrl) {
                JsonContent[i].addToInbox = _ToInbox;
                break;
            }
        }

        fs.writeFileSync(saveFilePath, JSON.stringify(JsonContent));
    }
}
module.exports.setIsAddedToInbox = setIsAddedToInbox;

// ---------------------------------------------------------------------------------------------------------------------
// PREFERENCES
// ---------------------------------------------------------------------------------------------------------------------

function setPreference(key, value) {
    if (fs.existsSync(preferencesFilePath)) {
        let JsonContent = {};

        if (fs.readFileSync(preferencesFilePath, 'utf-8') === '') {
            JsonContent = {};
        } else {
            JsonContent = JSON.parse(fs.readFileSync(preferencesFilePath, 'utf-8'));
        }

        JsonContent[key] = value;

        fs.writeFileSync(preferencesFilePath, JSON.stringify(JsonContent, null, 4));
    }
}
module.exports.setPreference = setPreference;

/**
 * @param {string} key - JSON key to search for in preferences file.
 * @param {any | undefined} defaultReturnValue - [optional] Value returned if key does not exist.
 * @returns {any | undefined} Value stored at key.
 * If defaultReturnValue is specified, that will be returned if the key is not found.
 * Otherwise returns undefined.
 */
function getPreference(key, defaultReturnValue) {
    if (fileExistsAndIsNotEmpty(preferencesFilePath)) {
        let JsonContent = JSON.parse(fs.readFileSync(preferencesFilePath, 'utf-8'));

        if (JsonContent[key] === undefined && defaultReturnValue !== undefined) {
            return defaultReturnValue;
        } else {
            return JsonContent[key];
        }
    }
}
module.exports.getPreference = getPreference;
