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

// ---------------------------------------------------------------------------------------------------------------------
// RIGHT COLUMN
// ---------------------------------------------------------------------------------------------------------------------

function clearContent()
{
    // document.getElementById("res").innerHTML = ""
    document.getElementById("list").innerHTML = ""
}

function setHeader(_Title)
{
    var Header = document.getElementById("content-right").getElementsByTagName("h1")[0]

    Header.innerHTML = _Title
}

function unsubscribe(_Self)
{
    if (fs.readFileSync(getSaveFilePath(), "utf-8") != "")
    {
        // NOTE: Remove optically

        _Self.parentElement.parentElement.removeChild(_Self.parentElement)

        // NOTE: Remove from JSON file and overwrite the file

        var JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))

        for (var i = 0; i < JsonContent.length; i++)
        {
            if (_Self.parentElement.getAttribute("feedUrl") == JsonContent[i].feedUrl)
            {
                JsonContent.splice(i, 1)
                break
            }
        }

        fs.writeFileSync(getSaveFilePath(), JSON.stringify(JsonContent))
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// PODCAST ENTRY
// ---------------------------------------------------------------------------------------------------------------------

function getPodcastElement(_Artwork, _Subtitle, _Title, _IconElement)
{
    var ListElement     = document.createElement("li")
    var TitleElement    = document.createElement("div")
    var SubtitleElement = document.createElement("div")
    var ImageElement    = document.createElement("img")

    ImageElement.src = _Artwork

    TitleElement.innerHTML = _Title
    TitleElement.classList.add("podcast-entry-title")

    SubtitleElement.innerHTML = _Subtitle
    SubtitleElement.classList.add("podcast-entry-subtitle")

    ListElement.classList.add("podcast-entry")

    if (_IconElement != undefined)
    {
        ListElement.innerHTML = _IconElement
    }

    if (_Artwork != null)
    {
        ListElement.append(ImageElement)
    }

    ListElement.append(TitleElement)
    ListElement.append(SubtitleElement)

    return ListElement
}

function deleteEntryWithIcon(_Self)
{
    deleteEntry(_Self.parentElement)
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

        _ListElement.parentElement.removeChild(_ListElement)

        // NOTE: Remove from JSON file and overwrite the file

        deleteFromFile(_ListElement.getAttribute("url"))
    }
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

    console.log(JsonContent.length);

    fs.writeFileSync(getNewEpisodesSaveFilePath(), JSON.stringify(JsonContent))
}

// ---------------------------------------------------------------------------------------------------------------------
// MENU
// ---------------------------------------------------------------------------------------------------------------------

function clearMenuSelection()
{
    var Menu      = document.getElementById("menu")
    var ListItems = Menu.getElementsByTagName("li")

    for (var i = 0; i < ListItems.length; i++)
    {
        ListItems[i].classList.remove("selected")
    }
}
