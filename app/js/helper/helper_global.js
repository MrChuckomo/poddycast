'use strict'

const fs = require('fs')
const os = require('os')

// ---------------------------------------------------------------------------------------------------------------------
// GLOBAL
// ---------------------------------------------------------------------------------------------------------------------

function getSaveDirPath() {
    return os.homedir() + '/poddycast-data'
}

function isWindows() {
    return process.platform === 'win32'
}

function isDarwin() {
    return process.platform === 'darwin'
}

function isLinux() {
    return process.platform === 'linux'
}

function getSaveFilePath() {
    return getSaveDirPath() + '/poddycast-favorite_podcasts.json'
}

function getNewEpisodesSaveFilePath() {
    return getSaveDirPath() + '/poddycast-new_episodes.json'
}

function getArchivedFilePath() {
    return getSaveDirPath() + '/poddycast-archived_episodes.json'
}

function getPlaylistFilePath() {
    return getSaveDirPath() + '/poddycast-playlists.json'
}

function getSettingsFilePath() {
    return getSaveDirPath() + '/poddycast-podcast_settings.json'
}

function getPreferencesFilePath() {
    return getSaveDirPath() + '/poddycast-app_preferences.json'
}

function init() {
    if (!fs.existsSync(getSaveDirPath())) {
        fs.mkdirSync(getSaveDirPath());
    }

    if (!fs.existsSync(getSaveFilePath())) {
        fs.openSync(getSaveFilePath(), 'w');
    }

    if (!fs.existsSync(getNewEpisodesSaveFilePath())) {
        fs.openSync(getNewEpisodesSaveFilePath(), 'w');
    }

    if (!fs.existsSync(getArchivedFilePath())) {
        fs.openSync(getArchivedFilePath(), 'w');
    }

    if (!fs.existsSync(getPlaylistFilePath())) {
        fs.openSync(getPlaylistFilePath(), 'w');
    }

    // check if user has old settings file
    if (fs.existsSync(getSettingsFilePath()))
    {
        upgradeSettingsFile()
    }

    if (!fs.existsSync(getPreferencesFilePath())) {
        fs.openSync(getPreferencesFilePath(), 'w');

        setPreference('darkmode', false)
        setPreference('minimize', false)
        setPreference('proxymode', false)
        setPreference('playspeed', 1.0)
        setPreference('volume', 0.75)
    }

    darkMode()

    document.getElementById("volume").value = getPreference('volume')
    document.getElementById("volume").dispatchEvent(new Event("input"))
    document.querySelector('#content-right-player-speed-indicator').innerHTML = getPreference('playspeed').toFixed(1) + "x"
    document.getElementById("player").playbackRate = parseFloat(getPreference('playspeed'))
    document.getElementById("player").defaultPlaybackRate = parseFloat(getPreference('playspeed'))
}

function fileExistsAndIsNotEmpty(_File) {
    return (fs.existsSync(_File) && fs.readFileSync(_File, 'utf-8') !== '')
}

function upgradeSettingsFile()
{
    var oldFilePath = getSettingsFilePath()
    var newFilePath = getSaveFilePath()
    
    // sync addToInbox values from old settings file
    if (fs.existsSync(oldFilePath) && fs.readFileSync(oldFilePath, "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(oldFilePath, "utf-8"))

        for (var i = 0; i < JsonContent.length; i++)
        {
            setIsAddedToInbox(JsonContent[i].feedUrl, JsonContent[i].addToInbox)
        }
    }

    // create addToInbox value to any remaining items in the favorites file
    if (fs.existsSync(newFilePath) && fs.readFileSync(newFilePath, "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(newFilePath, "utf-8"))

        for (var i = 0; i < JsonContent.length; i++)
        {
            if (!JsonContent[i].hasOwnProperty('addToInbox'))
            {
                setIsAddedToInbox(JsonContent[i].feedUrl, true)
            }
        }
    }

    // rename old settings file so that it is not processed again in the future
    fs.renameSync(oldFilePath, oldFilePath + ".old")
}

function isAlreadySaved(_FeedUrl)
{
    var FeedExists  = false;

    if (fs.readFileSync(getSaveFilePath(), 'utf-8') !== '') {
        let JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), 'utf-8'))

        for (let i = 0; i < JsonContent.length; i ++) {
            if (JsonContent[i].feedUrl === _FeedUrl) {
                FeedExists = true
                break
            }
        }
    }

    return FeedExists
}

function isEpisodeAlreadySaved(_EpisodeTitle) {
    let FeedExists = false;

    if (fs.readFileSync(getNewEpisodesSaveFilePath(), 'utf-8') !== '') {
        let JsonContent = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), 'utf-8'))

        for (let i = 0; i < JsonContent.length; i ++) {
            if (JsonContent[i].episodeTitle === _EpisodeTitle) {
                FeedExists = true
                break
            }
        }
    }

    return FeedExists
}

function isAlreadyInPlaylist(_ListName, _PodcastName) {
    let JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), 'utf-8'))
    let Result = false

    for (let i = 0; i < JsonContent.length; i++) {
        if (JsonContent[i].playlistName === _ListName) {
            for (let j = 0; j < JsonContent[i].podcastList.length; j++) {
                if (JsonContent[i].podcastList[j] === _PodcastName) {
                    Result = true
                    break
                }
            }
        }
    }

    return Result
}

function getValueFromFile(_File, _DestinationTag, _ReferenceTag, _Value) {
    let DestinationValue = null

    if (fs.existsSync(_File()) && fs.readFileSync(_File(), 'utf-8') !== '') {
        let JsonContent = JSON.parse(fs.readFileSync(_File(), 'utf-8'))

        for (let i = 0; i < JsonContent.length; i++) {
            if (JsonContent[i][_ReferenceTag] === _Value) {
                DestinationValue = JsonContent[i][_DestinationTag]
                break
            }
        }
    }

    return DestinationValue
}

function clearTextField(_InputField) {
    _InputField.value = ''
}

function focusTextField(_InputField) {
    document.getElementById(_InputField).focus()
}

function loseFocusTextField(_InputField) {
    document.getElementById(_InputField).blur()
}

function getFullTime(_TimeInSeconds) {
    let FullTime = {}
    let Hours = Math.floor(_TimeInSeconds / 3600)

    _TimeInSeconds = _TimeInSeconds - (Hours * 3600)

    let Minutes = Math.floor(_TimeInSeconds / 60)
    let Seconds = Math.floor(_TimeInSeconds - (Minutes * 60))

    FullTime.hours = Hours
    FullTime.minutes = Minutes
    FullTime.seconds = Seconds

    return FullTime
}

function parseFeedEpisodeDuration(_Duration) {
    let Time = {}
    let Hours = '0'
    let Minutes = '0'

    if (_Duration.length === 1) {
        Time = getFullTime(_Duration[0] * 60)
        Hours = '0'
        Minutes = Time.hours.toString()
    } else if (_Duration.length === 2) {
        Time = getFullTime(_Duration[0] * 60)
        Hours = Time.hours.toString()
        Minutes = Time.minutes.toString()
    } else {
        Hours = _Duration[0]
        Minutes = _Duration[1]
    }

    Hours = Hours.replace(/^0/, '')
    Minutes = Minutes.replace(/^0/, '')

    Time.hours = ((Hours === '') ? '0' : Hours)
    Time.minutes = Minutes

    return Time
}

// ---------------------------------------------------------------------------------------------------------------------
// SETTINGS
// ---------------------------------------------------------------------------------------------------------------------

function setProxyMode() {
    const { app, Menu } = require('electron').remote

    let MenuItems = Menu.getApplicationMenu().items

    for (let i = MenuItems.length - 1; i >= 0; i--) {
        if (MenuItems[i].label === i18n.__('Settings')) {

            // NOTE: Item 0 is "Use Proxy" for now

            ProxySettings = MenuItems[i].submenu.items[0].checked

            if (ProxySettings) {
                setPreference('proxymode', true)
            } else {
                setPreference('proxymode', false)
            }
        }
    }
}

function isProxySet() {
    let ProxySettings = false
    const { app, Menu } = require('electron').remote

    let MenuItems = Menu.getApplicationMenu().items

    for (let i = MenuItems.length - 1; i >= 0; i --) {
        if (MenuItems[i].label === i18n.__('Settings')) {

            // NOTE: Item 0 is "Use Proxy" for now

            ProxySettings = MenuItems[i].submenu.items[0].checked
        }
    }

    return ProxySettings
}

/**
 * @deprecated No longer needed after merging of settings and favorites files.
 * @param {string} _PodcastName 
 * @param {string} _FeedUrl 
 */
function addToSettings(_PodcastName, _FeedUrl)
{
    if (fs.existsSync(getSettingsFilePath()))
    {
        var SettingsObject =
        {
            "podcastName": _PodcastName,
            "feedUrl": _FeedUrl,
            "addToInbox": true,
        }

        let JsonContent = []

        if (fs.existsSync(getSettingsFilePath()) && fs.readFileSync(getSettingsFilePath(), 'utf-8') !== '') {
            JsonContent = JSON.parse(fs.readFileSync(getSettingsFilePath(), 'utf-8'))
        } else {
            fs.writeFileSync(getSettingsFilePath(), JSON.stringify(JsonContent))
        }

        if (!isInSettings(_FeedUrl)) {
            JsonContent.push(SettingsObject)
        }

        fs.writeFileSync(getSettingsFilePath(), JSON.stringify(JsonContent))
    }
}

/**
 * @deprecated Replaced with isAddedToInbox to improve usage clarity
 * @param {*} _FeedUrl 
 */
function getSettings(_FeedUrl)
{
    var ToInbox = true

    if (fs.existsSync(getSaveFilePath()) && fs.readFileSync(getSaveFilePath(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))

        for (var i = 0; i < JsonContent.length; i++)
        {
            if (JsonContent[i].feedUrl == _FeedUrl)
            {
                ToInbox = JsonContent[i].addToInbox

                break
            }
        }
    }

    return ToInbox
}

function isAddedToInbox(_FeedUrl)
{
    var ToInbox = true

    if (fs.existsSync(getSaveFilePath()) && fs.readFileSync(getSaveFilePath(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))

        for (let i = 0; i < JsonContent.length; i++) {
            if (JsonContent[i].feedUrl === _FeedUrl) {
                ToInbox = JsonContent[i].addToInbox
                break
            }
        }
    }

    return ToInbox
}

function isInSettings(_FeedUrl) {
    let Result = false

    if (fs.existsSync(getSaveFilePath()) && fs.readFileSync(getSaveFilePath(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))

        for (let i = 0; i < JsonContent.length; i++) {
            if (JsonContent[i].feedUrl === _FeedUrl) {
                Result = true
                break
            }
        }
    }

    return Result
}

/**
 * @deprecated Replaced with setIsAddedToInbox to improve usage clarity
 * @param {*} _FeedUrl 
 * @param {*} _ToInbox 
 */
function changeSettings(_FeedUrl, _ToInbox)
{
    if (fs.existsSync(getSaveFilePath()) && fs.readFileSync(getSaveFilePath(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))

        for (let i = 0; i < JsonContent.length; i++) {
            if (JsonContent[i].feedUrl === _FeedUrl) {
                JsonContent[i].addToInbox = _ToInbox
                break
            }
        }

        fs.writeFileSync(getSaveFilePath(), JSON.stringify(JsonContent))
    }
}

function setIsAddedToInbox(_FeedUrl, _ToInbox)
{
    if (fs.existsSync(getSaveFilePath()) && fs.readFileSync(getSaveFilePath(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))

        for (var i = 0; i < JsonContent.length; i++)
        {
            if (JsonContent[i].feedUrl == _FeedUrl)
            {
                JsonContent[i].addToInbox = _ToInbox

                break
            }
        }

        fs.writeFileSync(getSaveFilePath(), JSON.stringify(JsonContent))
    }
}

function setMinimize() {
    const { app, Menu } = require('electron').remote

    let MenuItems = Menu.getApplicationMenu().items

    for (let i = MenuItems.length - 1; i >= 0; i--) {
        if (MenuItems[i].label === i18n.__('Settings')) {

            // NOTE: Item 0 is "Use Proxy" for now

            MinimizeSettings = MenuItems[i].submenu.items[1].checked

            if (MinimizeSettings) {
                setPreference('minimize', true)
            } else {
                setPreference('minimize', false)
            }
        }
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// PREFERENCES
// ---------------------------------------------------------------------------------------------------------------------

function setPreference(_Key, _Value) {
    if (fs.existsSync(getPreferencesFilePath())) {
        let JsonContent = {}

        if (fs.readFileSync(getPreferencesFilePath(), 'utf-8') === '') {
            JsonContent = {}
        } else {
            JsonContent = JSON.parse(fs.readFileSync(getPreferencesFilePath(), 'utf-8'))
        }

        JsonContent[_Key] = _Value

        fs.writeFileSync(getPreferencesFilePath(), JSON.stringify(JsonContent))
    }
}


function getPreference(_Key) {
    if (fs.existsSync(getPreferencesFilePath()) && fs.readFileSync(getPreferencesFilePath(), 'utf-8') !== '') {
        let JsonContent = JSON.parse(fs.readFileSync(getPreferencesFilePath(), 'utf-8'))

        return JsonContent[_Key]
    }
}

module.exports = getPreference
