const fs = require('fs')
const os = require('os')

var titlebar = null;
var allPreferences = null;

// ---------------------------------------------------------------------------------------------------------------------
// GLOBAL
// ---------------------------------------------------------------------------------------------------------------------

class Preferences {
    constructor() {
        this.load();
    }

    load() {
        if (!fs.existsSync(getPreferencesFilePath()))
            fs.openSync(getPreferencesFilePath(), 'w');
        
        let fileContent = ifExistsReadFile(getPreferencesFilePath());
        this.preference = JSON.parse(fileContent == "" ? "{}": fileContent);
        this.check();
    }

    update() {
        fs.writeFileSync(getPreferencesFilePath(), JSON.stringify(this.preference, null, "\t"));
    }

    check() {
        if(!this.preference.darkmode)
            this.preference.darkmode = false;
        if(!this.preference.minimize)
            this.preference.minimize = false;
        if(!this.preference.proxymode)
            this.preference.proxymode = false;
        
        if(!this.preference.darkmode || !this.preference.minimize || !this.preference.proxymode )
            this.update();
    }

    setDarkmode(darkmode) {
        this.preference.darkmode = darkmode;
        this.update();
    }

    getDarkmode() {
        return this.preference.darkmode;
    }

    setMinimize(minimize) {
        this.preference.minimize = minimize;
        this.update();
    }

    getMinimize() {
        return this.preference.minimize;
    }

    setProxymode(proxymode) {
        this.preference.proxymode = proxymode;
        this.update();
    }

    getProxymode() {
        return this.preference.proxymode;
    }

    set(preference, value) {
        this.preference[preference] = value;
        this.update();
    }

    get(preference) {
        return this.preference[preference];
    }
}

function loadPreferences() {
    allPreferences = new Preferences();
}

function getSaveDirPath() {
    return os.homedir() + '/poddycast-data';
}

function getFeedDirPath() {
    return getSaveDirPath() + '/podcast-feeds';
}

function getIndexFeedFilePath() {
    return getFeedDirPath() + '/index.json';
}

function isWindows()
{
    return process.platform == 'win32';
}

function isDarwin() {
    return process.platform == 'darwin';
}

function isLinux() {
    return process.platform == 'linux';
}

function getSaveFilePath() {
    return getSaveDirPath() + '/poddycast-favorite_podcasts.json';
}

function getNewEpisodesSaveFilePath() {
    return getSaveDirPath() + '/poddycast-new_episodes.json';
}

function getArchivedFilePath() {
    return getSaveDirPath() + '/poddycast-archived_episodes.json';
}

function getPlaylistFilePath() {
    return getSaveDirPath() + '/poddycast-playlists.json';
}

function getPreferencesFilePath() {
    return getSaveDirPath() + '/poddycast-app_preferences.json';
}

function setTitlebarOnWin() {
    if(isWindows()) {
        const customTitlebar = require('custom-electron-titlebar');
        titlebar = new customTitlebar.Titlebar({
            backgroundColor: customTitlebar.Color.fromHex('#ccc')
        });
        $( '#content-left' ).height('calc(100% - 30px)');
        $( '#content-right' ).height('calc(100% - 30px)');
        
        function setMenuBarVisibility(visibility) {
            if(visibility)
                $( '.menubar' ).removeAttr('style');
            else {
                $( '.menubar' ).css('height', '0');
                $( '.menubar' ).css('padding', '0');
                $( '.menubar' ).css('overflow', 'hidden');
            }
        }

        menuBarVisibility = false;
        setMenuBarVisibility(menuBarVisibility);
        $(document).keydown( (e) => { 
            if(e.altKey) {
                menuBarVisibility = !menuBarVisibility
                setMenuBarVisibility(menuBarVisibility);
            }
        })
    }
}

function setSearchWithoutFocus() {
    $(document).keypress(function (e) {
        let char = String.fromCharCode(e.which)
        if(!char.match(/^[^A-Za-z0-9+!?#\.\-\ ]+$/) && !$("input:focus").get(0)) {
            $('#search-input').focus();
        }
    })
}

function setTitle(title) {
    if(isWindows())
        titlebar.updateTitle(title);
    else 
        BrowserWindow.getAllWindows()[0].setTitle(title);
}

function init() {
    setTitlebarOnWin();
    
    if (!fs.existsSync(getSaveDirPath()))
        fs.mkdirSync(getSaveDirPath());

    if (!fs.existsSync(getArchivedFilePath()))
        fs.openSync(getArchivedFilePath(), 'w');

    loadPreferences();
    loadFeeds();
    loadPlaylists();
    loadFavoritePodcasts();
    loadNewEpisodes();

    darkMode();

    setSearchWithoutFocus()

    initController()
    
    readFeeds()
    setItemCounts()
    translate()
    showNewEpisodesPage()
}

function fileExistsAndIsNotEmpty(_File) {
    return (fs.existsSync(_File) && fs.readFileSync(_File, "utf-8") != "")
}

function isAlreadyFavorite(_FeedUrl) {
   return (allFavoritePodcasts.findByFeedUrl(_FeedUrl) != -1);
}

function episodeIsAlreadyInNewEpisodes(episodeUrl) {
    return (allNewEpisodes.findByEpisodeUrl(episodeUrl) != -1);
}

function isAlreadyInPlaylist(_ListName, _PodcastFeed) {
    let i = allPlaylist.memory.findByName(_ListName);
    return (allPlaylist.memory.findPodcast(i, _PodcastFeed) != -1);
}

function getFileValue(filePath, _DestinationTag, _ReferenceTag, _Value) {
    var DestinationValue = null;

    let fileContent = ifExistsReadFile(filePath);
    if (fileContent == "")
        return DestinationValue;
    
    var json = JSON.parse(fileContent)

    for (let i in json)
        if (json[i][_ReferenceTag] == _Value) {
            DestinationValue = json[i][_DestinationTag];
            return DestinationValue;
        }

    return DestinationValue;
}

function getBestArtworkUrl(feedUrl) {
    let podcast = allFavoritePodcasts.getByFeedUrl(feedUrl);

    if(podcast != undefined) {
        let Artwork = podcast.artworkUrl100;
        if(Artwork != undefined && Artwork != 'undefined')
            return Artwork;
        
        Artwork = podcast.artworkUrl60;
        if(Artwork != undefined && Artwork != 'undefined')
            return Artwork;
    }

    //Set "no Artwork" image
    Artwork = getGenericArtwork();
    return Artwork;
}

function getArtworkFromFeed(xmlDoc) {
    if (xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("media:thumbnail")[0] !== undefined) 
        return xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("media:thumbnail")[0].getAttribute("url")
    
    if (xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("itunes:image")[0] !== undefined) 
        return xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("itunes:image")[0].getAttribute("href")
    
    // Find any element with 'href' or 'url' attribute containing an image (podcast thumbnail)
    for (let i in xmlDoc.getElementsByTagName("channel")) {
        if (xmlDoc.getElementsByTagName("channel")[i].querySelector("*[href*='.jpeg'], *[href*='.jpg'], *[href*='.png']").length !== 0) {
            return xmlDoc.getElementsByTagName("channel")[i].querySelector("*[href*='.jpeg'], *[href*='.jpg'], *[href*='.png']").getAttribute('href')
        } else if (xmlDoc.getElementsByTagName("channel")[i].querySelector("*[url*='.jpeg'], *[url*='.jpg'], *[url*='.png']").length !== 0) {
            return xmlDoc.getElementsByTagName("channel")[i].querySelector("*[href*='.jpeg'], *[href*='.jpg'], *[href*='.png']").getAttribute('url')
        }
    }
    
    return getGenericArtwork();
}

function getGenericArtwork() {
    return 'img/generic_podcast_image.png';
}

function isGenericArtwork(Artwork) {
    return (Artwork == getGenericArtwork());
}

function ifExistsReadFile(filePath) {
    let fileContent = "";
    if(fs.existsSync(filePath))
        fileContent = fs.readFileSync(filePath, "utf-8");
    return fileContent;
}

function clearTextField(_InputField) {
    _InputField.value = ""
}

function focusTextField(_InputField) {
    document.getElementById(_InputField).focus()
}

function loseFocusTextField(_InputField) {
    document.getElementById(_InputField).blur()
}

function getFullTime(_TimeInSeconds)
{
    var FullTime = {}

    var Hours = Math.floor(_TimeInSeconds / 3600)

    _TimeInSeconds = _TimeInSeconds - (Hours * 3600)

    var Minutes = Math.floor(_TimeInSeconds / 60)
    var Seconds = Math.floor(_TimeInSeconds - (Minutes * 60))

    FullTime.hours = Hours
    FullTime.minutes = Minutes
    FullTime.seconds = Seconds

    return FullTime
}

function parseFeedEpisodeDuration(_Duration) {
    if(_Duration == '') {
        return {
            minutes: "#",
            hours: "#"
        }
    }
    var Time = {}

    if (_Duration.length == 1)
    {
        var Time    = getFullTime(_Duration[0] * 60)
        var Hours   = "0"
        var Minutes = Time.hours.toString()
    }
    else if (_Duration.length == 2)
    {
        var Time    = getFullTime(_Duration[0] * 60)
        var Hours   = Time.hours.toString()
        var Minutes = Time.minutes.toString()
    }
    else
    {
        var Hours   = _Duration[0]
        var Minutes = _Duration[1]
    }

    Hours   = Hours.replace(/^0/, "")
    Minutes = Minutes.replace(/^0/, "")

    Time.hours = ((Hours == "") ? "0" : Hours)
    Time.minutes = Minutes

    Time.hours = "" + (parseInt(Time.hours) + Math.floor(parseInt(Time.minutes) / 60));
    Time.minutes = "" + (parseInt(Time.minutes) % 60);

    return Time
}

// ---------------------------------------------------------------------------------------------------------------------
// SETTINGS
// ---------------------------------------------------------------------------------------------------------------------

function getProxyModeMenuItem() {
    const { Menu } = require('electron').remote

    let MenuItems = Menu.getApplicationMenu().items

    for (let i = MenuItems.length - 1; i >= 0; i--)
    {
        if (MenuItems[i].label == i18n.__('Settings'))
        {
            // NOTE: Item 0 is "Use Proxy" for now

            return MenuItems[i].submenu.items[0];
        }
    }
}

function changeProxyModeMenuItem() {
    let ProxyModeMenuItem = getProxyModeMenuItem()
    ProxyModeMenuItem.checked = !getPreference('proxymode');
}

function setProxyMode() {
    let ProxyModeMenuItem = getProxyModeMenuItem()
    
    if (ProxyModeMenuItem.checked)
        setPreference('proxymode', true)
    else
        setPreference('proxymode', false)
}

function isProxySet() {
    return getPreference('proxymode');
}
 
function getSettings(_FeedUrl) {
    return allFavoritePodcasts.getExcludeFromNewEpisodesByFeedUrl(_FeedUrl);
}

function changeSettings(_FeedUrl, excludeFromNewEpisodes) {
    allFavoritePodcasts.setExcludeFromNewEpisodesByFeedUrl(_FeedUrl, excludeFromNewEpisodes);
    
}

function setMinimize() {
    let MinimizeMenuItem = getMinimizeMenuItem()
    
    if (MinimizeMenuItem.checked)
        setPreference('minimize', true)
    else
        setPreference('minimize', false)
}

function changeMinimizeMenuItem() {
    let MinimizeMenuItem = getMinimizeMenuItem()
    MinimizeMenuItem.checked = !getPreference('minimize');
}

function getMinimizeMenuItem() {
    const { Menu } = require('electron').remote

    var MenuItems = Menu.getApplicationMenu().items

    for (var i = MenuItems.length - 1; i >= 0; i--) {
        if (MenuItems[i].label == i18n.__('Settings')) {

            return MenuItems[i].submenu.items[1];
        }
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// PREFERENCES
// ---------------------------------------------------------------------------------------------------------------------

function setPreference(_Key, _Value) {
    if(allPreferences.get(_Key) !== _Value)
        allPreferences.set(_Key, _Value);
}


function getPreference(_Key) {
    if(allPreferences)
        return allPreferences.get(_Key);
    
    if (fs.existsSync(getPreferencesFilePath()) && fs.readFileSync(getPreferencesFilePath(), "utf-8") != "") {
        let JsonContent = JSON.parse(fs.readFileSync(getPreferencesFilePath(), "utf-8"));
        return JsonContent[_Key];
    }
}

module.exports = getPreference
