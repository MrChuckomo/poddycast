// ---------------------------------------------------------------------------------------------------------------------
// GLOBAL
// ---------------------------------------------------------------------------------------------------------------------
function getSaveDirPath()
{
    return process.env['HOME'] + "/Desktop/poddycast-data"
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

function getFromFavoritePodcastFile(_DestinationTag, _ReferenceTag, _Value)
{
    var DestinationValue = null

    if (fs.existsSync(getSaveFilePath()) && fs.readFileSync(getSaveFilePath(), "utf-8") != "")
    {
        var FavoritesJsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))

        for (var i = 0; i < FavoritesJsonContent.length; i++)
        {
            if (FavoritesJsonContent[i][_ReferenceTag] == _Value)
            {
                DestinationValue = FavoritesJsonContent[i][_DestinationTag]

                break
            }
        }
    }

    return DestinationValue
}

function getFromNewEpisodesFile(_DestinationTag, _ReferenceTag, _Value)
{
    var DestinationValue = null

    if (fs.existsSync(getNewEpisodesSaveFilePath()) && fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8") != "")
    {
        var NewEpisodesJsonContent = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8"))

        for (var i = 0; i < NewEpisodesJsonContent.length; i++)
        {
            if (NewEpisodesJsonContent[i][_ReferenceTag] == _Value)
            {
                DestinationValue = NewEpisodesJsonContent[i][_DestinationTag]

                break
            }
        }
    }

    return DestinationValue
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

// ---------------------------------------------------------------------------------------------------------------------
// PODCAST ENTRY
// ---------------------------------------------------------------------------------------------------------------------

function getPodcastElement(_Artwork, _Subtitle, _Title, _IconElement)
{
    var ListElement     = document.createElement("li")
    var TitleElement    = document.createElement("div")
    var SubtitleElement = document.createElement("div")
    // var EntryBodyElement  = document.createElement("div")
    var ImageElement    = document.createElement("img")

    ImageElement.src = _Artwork

    TitleElement.innerHTML = _Title
    TitleElement.classList.add("podcast-entry-title")

    SubtitleElement.innerHTML = _Subtitle
    SubtitleElement.classList.add("podcast-entry-subtitle")

    // EntryBodyElement.classList.add("podcast-entry-body")
    // EntryBodyElement.append(SubtitleElement)
    // EntryBodyElement.append(TitleElement)

    ListElement.classList.add("podcast-entry")

    if (_IconElement != undefined)
    {
        ListElement.innerHTML = _IconElement
    }

    ListElement.append(ImageElement)
    ListElement.append(TitleElement)
    ListElement.append(SubtitleElement)

    return ListElement
}

function getArtWorkFromChannelName(_ChannelName)
{
    var Artwork = undefined

    if (fs.existsSync(getSaveFilePath()))
    {
        var JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))

        for (var i = 0; i < JsonContent.length; i++)
        {
            if (JsonContent[i].collectionName == _ChannelName)
            {
                Artwork = JsonContent[i].artworkUrl60
                break
            }
        }
    }

    return Artwork
}

function deleteEntry(_Self)
{
    if (fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8") != "")
    {
        // NOTE: Remove optically

        _Self.parentElement.parentElement.removeChild(_Self.parentElement)

        // NOTE: Remove from JSON file and overwrite the file

        var JsonContent = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8"))

        console.log(JsonContent.length);

        for (var i = 0; i < JsonContent.length; i++)
        {
            if (_Self.parentElement.getAttribute("url") == JsonContent[i].episodeUrl)
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
