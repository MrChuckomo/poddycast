// ---------------------------------------------------------------------------------------------------------------------
// GLOBAL
// ---------------------------------------------------------------------------------------------------------------------
function getSaveFilePath()
{
    return process.env['HOME'] + "/Desktop/poddycast-favorite_podcasts.json"
}

function getNewEpisodesSaveFilePath()
{
    return process.env['HOME'] + "/Desktop/poddycast-new_episodes.json"
}

function getArchivedFilePath()
{
    return process.env['HOME'] + "/Desktop/poddycast-archived_episodes.json"
}

function isAlreadySaved(_FeedUrl)
{
    var JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))
    var FeedExists  = false;

    for (var i = 0; i < JsonContent.length; i ++)
    {
        if (JsonContent[i].feedUrl == _FeedUrl)
        {
            FeedExists = true
            break
        }
    }

    return FeedExists
}

function isEpisodeAlreadySaved(_EpisodeTitle)
{
    var JsonContent = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8"))
    var FeedExists  = false;

    for (var i = 0; i < JsonContent.length; i ++)
    {
        if (JsonContent[i].episodeTitle == _EpisodeTitle)
        {
            FeedExists = true
            break
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
    console.log(_Self);
    console.log(_Self.parentElement);
    console.log(_Self.parentElement.parentElement);

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
                "archivedType": "deleted"
            }

            var ArchiveJsonContent = []

            // TODO: save delete file properly

            ArchiveJsonContent.push(Feed)

            if (!fs.existsSync(getArchivedFilePath()))
            {
                fs.writeFileSync(getArchivedFilePath(), JSON.stringify(ArchiveJsonContent))
            }

            var ArchiveJsonContent = JSON.parse(fs.readFileSync(getArchivedFilePath(), "utf-8"))

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
