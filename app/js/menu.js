
function selectMenuItem(_MenuId)
{
    // var MenuItem = _Self
    var MenuItem = document.getElementById(_MenuId)

    clearTextField(document.getElementById("search").getElementsByTagName("input")[0])
    clearPlaylists()
    clearMenuSelection()

    MenuItem.classList.add("selected")

    setHeader(MenuItem.getElementsByTagName("span")[0].innerHTML)
}

function showNewEpisodes()
{
    clearContent()

    if (fs.existsSync(getNewEpisodesSaveFilePath()) && fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8") != "")
    {
        var JsonContent  = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8"))
        var List         = document.getElementById("list")

        setGridLayout(List, false)

        for (var i = 0; i < JsonContent.length; i++)
        {
            var Artwork = getValueFromFile(getSaveFilePath, "artworkUrl60", "collectionName", JsonContent[i].channelName)

            if (getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", JsonContent[i].channelName) != undefined && getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", JsonContent[i].channelName) != "undefined")
            {
                Artwork = getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", JsonContent[i].channelName)
            }

            if (Artwork != null)
            {
                var ListElement = getPodcastElement(null, Artwork, JsonContent[i].channelName, JsonContent[i].episodeTitle, s_DeleteIcon)
                // var ListElement = getPodcastElement(null, Artwork, JsonContent[i].channelName, JsonContent[i].episodeTitle, s_MoreOptionIcon)

                if (isPlaying(JsonContent[i].episodeUrl))
                {
                //     ListElement = getPodcastElement(null, Artwork, JsonContent[i].channelName, JsonContent[i].episodeTitle, s_PlayIcon)
                    ListElement.classList.add("select-episode")
                }

                var HeaderElement = ListElement.getElementsByClassName("podcast-entry-header")[0]

                HeaderElement.setAttribute("onclick", "playNow(this)")
                HeaderElement.setAttribute("type", JsonContent[i].episodeType)
                HeaderElement.setAttribute("url", JsonContent[i].episodeUrl)
                HeaderElement.setAttribute("length", JsonContent[i].episodeLength)
                HeaderElement.setAttribute("artworkUrl", Artwork)

                List.append(ListElement)
            }
        }
    }
}

function showFavorites()
{
    if (fs.existsSync(getSaveFilePath()) && fs.readFileSync(getSaveFilePath(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))

        clearContent()

        JsonContent = sortByName(JsonContent)

        var List = document.getElementById("list")

        setGridLayout(List, true)

        for (var i = 0; i < JsonContent.length; i++)
        {
            var Artwork = JsonContent[i].artworkUrl60

            if (JsonContent[i].artworkUrl100 != undefined && JsonContent[i].artworkUrl100 != "undefined")
            {
                Artwork = JsonContent[i].artworkUrl100
            }

            var ListElement = getPodcastElement("podcast-entry", Artwork, null, JsonContent[i].collectionName, s_Favorite)

            ListElement.setAttribute("draggable", true)
            ListElement.addEventListener('dragstart', handleDragStart, false);

            var HeaderElement = ListElement.getElementsByClassName("podcast-entry-header")[0]

            HeaderElement.getElementsByTagName("img")[0].setAttribute("draggable", false)
            HeaderElement.setAttribute("feedUrl", JsonContent[i].feedUrl)
            HeaderElement.setAttribute("onclick", "showAllEpisodes(this)")

            List.append(ListElement)
        }
    }
}



function showHistory()
{
    clearContent()

    if (fs.existsSync(getArchivedFilePath()) && fs.readFileSync(getArchivedFilePath(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(getArchivedFilePath(), "utf-8"))
        var List        = document.getElementById("list")

        setGridLayout(List, false)

        // NOTE: Show just the last 100 entries in History
        // TODO: The can be loaded after user interaction

        var Count = ((JsonContent.length <= 100) ? JsonContent.length : 100)

        for (var i = 0; i < Count; i++)
        {
            var ChannelName  = JsonContent[i].channelName
            var EpisodeTitle = JsonContent[i].episodeTitle
            var Artwork      = getValueFromFile(getSaveFilePath, "artworkUrl60", "collectionName", ChannelName)

            if (getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", ChannelName) != undefined && getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", ChannelName) != "undefined")
            {
                Artwork = getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", ChannelName)
            }

            if (Artwork != null)
            {
                var DateTime    = new Date(JsonContent[i].date)
                var ListElement = getPodcastElement(null, Artwork, DateTime.toLocaleString(), EpisodeTitle)

                List.insertBefore(ListElement, List.childNodes[0])
            }
        }
    }
}


// ---------------------------------------------------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------------------------------------------------

function sortByName(_Json)
{
    var SortArray = []
    var SortJson  = []

    for (var i = 0; i < _Json.length; i++)
    {
        SortArray.push(_Json[i].collectionName)
    }

    SortArray.sort()

    for (var i = 0; i < SortArray.length; i++)
    {
        for (var j = 0; j < _Json.length; j++)
        {
            if (_Json[j].collectionName == SortArray[i])
            {
                SortJson.push(_Json[j])

                break
            }
        }
    }

    return SortJson
}
