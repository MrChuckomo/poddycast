

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
        var JsonContent = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8"))
        var List        = document.getElementById("list")

        for (var i = 0; i < JsonContent.length; i++)
        {
            var Artwork = getValueFromFile(getSaveFilePath, "artworkUrl60", "collectionName", JsonContent[i].channelName)

            if (getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", JsonContent[i].channelName) != undefined && getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", JsonContent[i].channelName) != "undefined")
            {
                Artwork = getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", JsonContent[i].channelName)
            }

            if (Artwork != null)
            {
                var ListElement = getPodcastElement(Artwork, JsonContent[i].channelName, JsonContent[i].episodeTitle, s_DeleteIcon)

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

        var List = document.getElementById("list")

        for (var i = 0; i < JsonContent.length; i++)
        {
            var Artwork = JsonContent[i].artworkUrl60

            if (JsonContent[i].artworkUrl100 != undefined && JsonContent[i].artworkUrl100 != "undefined")
            {
                Artwork = JsonContent[i].artworkUrl100
            }

            var ListElement = getPodcastElement(Artwork, JsonContent[i].artistName, JsonContent[i].collectionName, s_Favorite)

            ListElement.setAttribute("feedUrl", JsonContent[i].feedUrl)
            ListElement.setAttribute("onclick", "showAllEpisodes(this)")

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
                var ListElement  = getPodcastElement(Artwork, JsonContent[i].date, EpisodeTitle)

                List.insertBefore(ListElement, List.childNodes[0])
            }
        }
    }
}
