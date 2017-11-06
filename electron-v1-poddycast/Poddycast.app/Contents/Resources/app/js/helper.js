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

function getPodcastElement(_Artwork, _ArtistName, _CollectioName, _IconElement)
{
    var ListElement       = document.createElement("li")
    var ArtistElement     = document.createElement("div")
    var CollectionElement = document.createElement("div")
    var EntryBodyElement  = document.createElement("div")
    var ImageElement      = document.createElement("img")

    ImageElement.src = _Artwork

    ArtistElement.innerHTML = _ArtistName
    ArtistElement.classList.add("podcast-entry-artist")

    CollectionElement.innerHTML = _CollectioName
    CollectionElement.classList.add("podcast-entry-collection")

    EntryBodyElement.classList.add("podcast-entry-body")
    EntryBodyElement.append(CollectionElement)
    EntryBodyElement.append(ArtistElement)

    ListElement.classList.add("podcast-entry")

    if (_IconElement != undefined)
    {
        ListElement.innerHTML = _IconElement
    }

    ListElement.append(ImageElement)
    ListElement.append(EntryBodyElement)

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
