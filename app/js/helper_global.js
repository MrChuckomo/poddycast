
const fs = require('fs')

// ---------------------------------------------------------------------------------------------------------------------
// GLOBAL
// ---------------------------------------------------------------------------------------------------------------------

function getSaveDirPath()
{
    var Base = process.env['HOME']

    switch (process.platform)
    {
        case "darwin": Base = process.env.HOME;        break;
        case "linux" : Base = process.env.HOMEPATH;    break;
        case "win32" : Base = process.env.USERPROFILE; break;
        default:

    }

    // return Base + "/Desktop/poddycast-data"
    return Base + "/poddycast-data"
}

function isWindows()
{
    return process.platform == "win32"
}

function isDarwin()
{
    return process.platform == "darwin"
}

function isLinux()
{
    return process.platform == "linux"
}

function getSaveFilePath()
{
    return getSaveDirPath() + "/poddycast-favorite_podcasts.json"
}

function getNewEpisodesSaveFilePath()
{
    return getSaveDirPath() + "/poddycast-new_episodes.json"
}

function getArchivedFilePath()
{
    return getSaveDirPath() + "/poddycast-archived_episodes.json"
}

function getPlaylistFilePath()
{
    return getSaveDirPath() + "/poddycast-playlists.json"
}

function getSettingsFilePath()
{
    return getSaveDirPath() + "/poddycast-podcast_settings.json"
}

function init()
{
    if (!fs.existsSync(getSaveDirPath()))
    {
        fs.mkdirSync(getSaveDirPath());
    }

    if (!fs.existsSync(getSaveFilePath()))
    {
        fs.openSync(getSaveFilePath(), 'w');
    }

    if (!fs.existsSync(getNewEpisodesSaveFilePath()))
    {
        fs.openSync(getNewEpisodesSaveFilePath(), 'w');
    }

    if (!fs.existsSync(getArchivedFilePath()))
    {
        fs.openSync(getArchivedFilePath(), 'w');
    }

    if (!fs.existsSync(getPlaylistFilePath()))
    {
        fs.openSync(getPlaylistFilePath(), 'w');
    }

    if (!fs.existsSync(getSettingsFilePath()))
    {
        fs.openSync(getSettingsFilePath(), 'w');
    }
}

function isAlreadySaved(_FeedUrl)
{
    var FeedExists  = false;

    if (fs.readFileSync(getSaveFilePath(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))

        for (var i = 0; i < JsonContent.length; i ++)
        {
            if (JsonContent[i].feedUrl == _FeedUrl)
            {
                FeedExists = true
                break
            }
        }
    }

    return FeedExists
}

function isEpisodeAlreadySaved(_EpisodeTitle)
{
    var FeedExists  = false;

    if (fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8"))

        for (var i = 0; i < JsonContent.length; i ++)
        {
            if (JsonContent[i].episodeTitle == _EpisodeTitle)
            {
                FeedExists = true
                break
            }
        }
    }

    return FeedExists
}

function isAlreadyInPlaylist(_ListName, _PodcastName)
{
    var JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), "utf-8"))
    var Result      = false

    for (var i = 0; i < JsonContent.length; i++)
    {
        if (JsonContent[i].playlistName == _ListName)
        {
            for (var j = 0; j < JsonContent[i].podcastList.length; j++)
            {
                if (JsonContent[i].podcastList[j] == _PodcastName)
                {
                    Result = true
                    break
                }
            }
        }
    }

    return Result
}

function getValueFromFile(_File, _DestinationTag, _ReferenceTag, _Value)
{
    var DestinationValue = null

    if (fs.existsSync(_File()) && fs.readFileSync(_File(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(_File(), "utf-8"))

        for (var i = 0; i < JsonContent.length; i++)
        {
            if (JsonContent[i][_ReferenceTag] == _Value)
            {
                DestinationValue = JsonContent[i][_DestinationTag]

                break
            }
        }
    }

    return DestinationValue
}

function isPlaying(_FeedUrl)
{
    var PlayerSource = document.getElementsByTagName("source")[0]

    return (PlayerSource.getAttribute("src") == _FeedUrl)
}

function clearTextField(_InputField)
{
    _InputField.value = ""
}

function focusTextField(_InputField)
{
    document.getElementById(_InputField).focus()
}

function loseFocusTextField(_InputField)
{
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

function parseFeedEpisodeDuration(_Duration)
{
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

    return Time
}

function getPrettyTime(_Time)
{
    return ((_Time < 10) ? "0" + _Time : _Time)
}

// ---------------------------------------------------------------------------------------------------------------------
// SETTINGS
// ---------------------------------------------------------------------------------------------------------------------

function isProxySet()
{
    var ProxySettings = false;
    const {app} = require('electron').remote

    var MenuItems = app.getApplicationMenu().items

    for (var i = MenuItems.length - 1; i >= 0 ; i --)
    {
        if (MenuItems[i].label == "Settings")
        {
            // NOTE: Item 0 is "Use Proxy" for now

            ProxySettings = MenuItems[i].submenu.items[0].checked
        }
    }

    return ProxySettings
}

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

        var JsonContent = []

        if (fs.existsSync(getSettingsFilePath()) && fs.readFileSync(getSettingsFilePath(), "utf-8") != "")
        {
            JsonContent = JSON.parse(fs.readFileSync(getSettingsFilePath(), "utf-8"))
        }
        else
        {
            fs.writeFileSync(getSettingsFilePath(), JSON.stringify(JsonContent))
        }

        if (!isInSettings(_FeedUrl))
        {
            JsonContent.push(SettingsObject)
        }

        fs.writeFileSync(getSettingsFilePath(), JSON.stringify(JsonContent))
    }
}

function getSettings(_FeedUrl)
{
    var ToInbox = true

    if (fs.existsSync(getSettingsFilePath()) && fs.readFileSync(getSettingsFilePath(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(getSettingsFilePath(), "utf-8"))

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

function isInSettings(_FeedUrl)
{
    var Result = false

    if (fs.existsSync(getSettingsFilePath()) && fs.readFileSync(getSettingsFilePath(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(getSettingsFilePath(), "utf-8"))

        for (var i = 0; i < JsonContent.length; i++)
        {
            if (JsonContent[i].feedUrl == _FeedUrl)
            {
                Result = true

                break
            }
        }
    }

    return Result
}

function changeSettings(_FeedUrl, _ToInbox)
{
    if (fs.existsSync(getSettingsFilePath()) && fs.readFileSync(getSettingsFilePath(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(getSettingsFilePath(), "utf-8"))

        for (var i = 0; i < JsonContent.length; i++)
        {
            if (JsonContent[i].feedUrl == _FeedUrl)
            {
                JsonContent[i].addToInbox = _ToInbox

                break
            }
        }

        fs.writeFileSync(getSettingsFilePath(), JSON.stringify(JsonContent))
    }
}
