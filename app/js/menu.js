
function selectMenuItem(_MenuId)
{
    // var MenuItem = _Self
    var MenuItem = document.getElementById(_MenuId)

    clearTextField(document.getElementById("search").getElementsByTagName("input")[0])
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

                if (isPlaying(JsonContent[i].episodeUrl))
                {
                    ListElement = getPodcastElement(null, Artwork, JsonContent[i].channelName, JsonContent[i].episodeTitle, s_PlayIcon)
                }

                ListElement.setAttribute("onclick", "playNow(this)")
                ListElement.setAttribute("type", JsonContent[i].episodeType)
                ListElement.setAttribute("url", JsonContent[i].episodeUrl)
                ListElement.setAttribute("length", JsonContent[i].episodeLength)

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

        for (var i = 0; i < JsonContent.length; i++)
        {
            var Artwork = JsonContent[i].artworkUrl60

            if (JsonContent[i].artworkUrl100 != undefined && JsonContent[i].artworkUrl100 != "undefined")
            {
                Artwork = JsonContent[i].artworkUrl100
            }

            var ListElement = getPodcastElement("podcast-favorites-entry", Artwork, null, JsonContent[i].collectionName, s_Favorite)

            ListElement.setAttribute("feedUrl", JsonContent[i].feedUrl)
            ListElement.setAttribute("onclick", "showAllEpisodes(this)")

            List.append(ListElement)
        }
    }
}

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

function showHistory()
{
    clearContent()

    if (fs.existsSync(getArchivedFilePath()) && fs.readFileSync(getArchivedFilePath(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(getArchivedFilePath(), "utf-8"))
        var List        = document.getElementById("list")

        for (var i = 0; i < JsonContent.length; i++)
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
                var ListElement  = getPodcastElement(null, Artwork, JsonContent[i].date, EpisodeTitle)

                List.insertBefore(ListElement, List.childNodes[0])
            }
        }
    }
}
