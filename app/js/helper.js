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

    if (_Duration.length == 2)
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

    Time.hours = Hours
    Time.minutes = Minutes

    return Time
}

function getPrettyTime(_Time)
{
    return ((_Time < 10) ? "0" + _Time : _Time)
}

// ---------------------------------------------------------------------------------------------------------------------
// LEFT COLUMN
// ---------------------------------------------------------------------------------------------------------------------
function setItemCounts()
{
    var NewEpisodesCount       = document.getElementById("menu-episodes").getElementsByClassName("menu-count")[0]
    NewEpisodesCount.innerHTML = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8")).length

    var FavoritesCount       = document.getElementById("menu-favorites").getElementsByClassName("menu-count")[0]
    FavoritesCount.innerHTML = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8")).length
}


// ---------------------------------------------------------------------------------------------------------------------
// RIGHT COLUMN
// ---------------------------------------------------------------------------------------------------------------------

function clearContent()
{
    // document.getElementById("res").innerHTML = ""
    document.getElementById("list").innerHTML = ""
}

function clearListSelection()
{
    var ListItems = document.getElementById("list").getElementsByTagName("li")

    for (var i = 0; i < ListItems.length; i++)
    {
        ListItems[i].classList.remove("select-episode")
    }
}

function setHeader(_Title)
{
    var Header = document.getElementById("content-right").getElementsByTagName("h1")[0]

    Header.innerHTML = _Title
}

function unsubscribe(_Self)
{
    // TODO: support also context menu unsubscribe (there is no reference to the svg heart icon)

    if (fs.readFileSync(getSaveFilePath(), "utf-8") != "")
    {
        // NOTE: Remove optically

        var ListElement = _Self.parentElement.parentElement;

        ListElement.parentElement.removeChild(ListElement)

        // NOTE: Remove from JSON file and overwrite the file

        // TODO: Remove also Episodes from New Episodes Menu

        var JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))

        for (var i = 0; i < JsonContent.length; i++)
        {
            if (ListElement.getElementsByClassName("podcast-entry-header")[0].getAttribute("feedUrl") == JsonContent[i].feedUrl)
            {
                JsonContent.splice(i, 1)
                break
            }
        }

        fs.writeFileSync(getSaveFilePath(), JSON.stringify(JsonContent))
    }

    setItemCounts()
}

// ---------------------------------------------------------------------------------------------------------------------
// PODCAST ENTRY
// ---------------------------------------------------------------------------------------------------------------------

function getPodcastElement(_Class, _Artwork, _Subtitle, _Title, _IconElement, _HeaderLayout)
{
    var ListElement     = document.createElement("li")
    var HeaderElement   = document.createElement("div")
    var ActionsElement  = document.createElement("div")
    var BodyElement     = document.createElement("div")

    var TitleElement    = document.createElement("div")
    var SubtitleElement = document.createElement("div")
    var ImageElement    = document.createElement("img")


    if (_HeaderLayout == null)
    {
        HeaderElement.classList.add("podcast-entry-header")
    }
    else
    {
        HeaderElement.classList.add(_HeaderLayout)
    }

    ActionsElement.classList.add("podcast-entry-actions")
    BodyElement.classList.add("podcast-entry-body")

    ImageElement.src = _Artwork

    TitleElement.innerHTML = _Title
    TitleElement.classList.add("podcast-entry-title")

    SubtitleElement.innerHTML = _Subtitle
    SubtitleElement.classList.add("podcast-entry-subtitle")

    ListElement.classList.add("podcast-entry")

    if (_Class       != null)      { ListElement.classList.remove("podcast-entry"); ListElement.classList.add(_Class) }
    if (_IconElement != undefined) { ActionsElement.innerHTML = _IconElement }
    if (_Artwork     != null)      { HeaderElement.append(ImageElement) }

    if (_Subtitle != null) { HeaderElement.append(SubtitleElement)}

    // ListElement.append(TitleElement)

    HeaderElement.append(TitleElement)

    ListElement.append(HeaderElement)
    ListElement.append(ActionsElement)
    ListElement.append(BodyElement)

    // ListElement.append(SubtitleElement)

    return ListElement
}

function setPodcastElementToDone(_ListElement)
{
    _ListElement.getElementsByClassName("podcast-entry-title")[0].classList.add("done")
}

function deleteEntryWithIcon(_Self)
{
    deleteEntry(_Self.parentElement.parentElement)
}

function deleteEntryWithAudioPlayer(_FeedUrl)
{
    // TODO: just catch list element if new episodes menu is open

    var AllListElements = document.getElementById("list").getElementsByTagName("li")
}

function deleteEntry(_ListElement)
{
    if (fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8") != "")
    {
        // NOTE: Remove optically

        deleteFromListView(_ListElement)

        // NOTE: Remove from JSON file and overwrite the file

        deleteFromFile(_ListElement.getElementsByClassName("podcast-entry-header")[0].getAttribute("url"))

        setItemCounts()
    }
}

function deleteFromListView(_ListElement)
{
    _ListElement.parentElement.removeChild(_ListElement)
}

function deleteFromFile(_FeedUrl)
{
    var JsonContent = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8"))

    for (var i = 0; i < JsonContent.length; i++)
    {
        if (_FeedUrl == JsonContent[i].episodeUrl)
        {
            var Feed =
            {
                "channelName": JsonContent[i].channelName,
                "episodeTitle": JsonContent[i].episodeTitle,
                "episodeUrl": JsonContent[i].episodeUrl,
                "archivedType": "deleted",
                "date": new Date
            }

            var ArchiveJsonContent = []

            if (fs.existsSync(getArchivedFilePath()) && fs.readFileSync(getArchivedFilePath(), "utf-8") != "")
            {
                ArchiveJsonContent = JSON.parse(fs.readFileSync(getArchivedFilePath(), "utf-8"))
            }
            else
            {
                fs.writeFileSync(getArchivedFilePath(), JSON.stringify(ArchiveJsonContent))
            }

            ArchiveJsonContent.push(Feed)

            fs.writeFileSync(getArchivedFilePath(), JSON.stringify(ArchiveJsonContent))

            JsonContent.splice(i, 1)
            break
        }
    }

    fs.writeFileSync(getNewEpisodesSaveFilePath(), JSON.stringify(JsonContent))
}

// ---------------------------------------------------------------------------------------------------------------------
// MENU
// ---------------------------------------------------------------------------------------------------------------------

function clearMenuSelection()
{
    var Menu      = document.getElementById("menu")
    var ListItems = Menu.getElementsByTagName("li")
    var Playlists = document.getElementById("playlists").getElementsByTagName("li")

    for (var i = 0; i < ListItems.length; i++)
    {
        ListItems[i].classList.remove("selected")
    }

    for (var i = 0; i < Playlists.length; i++)
    {
        Playlists[i].classList.remove("selected")
    }
}


function dragToPlaylist(_PlaylistName, _PodcastName)
{
    var JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), "utf-8"))

    for (var i = 0; i < JsonContent.length; i++)
    {
        if (JsonContent[i].playlistName == _PlaylistName)
        {
            var PodcastList = JsonContent[i].podcastList

            if (!isAlreadyInPlaylist(_PlaylistName, _PodcastName))
            {
                PodcastList.push(_PodcastName)
            }

            break
        }
    }

    fs.writeFileSync(getPlaylistFilePath(), JSON.stringify(JsonContent))
}
