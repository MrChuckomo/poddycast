
function selectMenuItem(_MenuId)
{
    // var MenuItem = _Self
    var MenuItem = document.getElementById(_MenuId)

    clearTextField(document.getElementById("search-input"))
    clearTextField(document.getElementById("new_list-input"))

    loseFocusTextField("search-input")
    loseFocusTextField("new_list-input")

    clearPlaylists()
    clearMenuSelection()

    MenuItem.classList.add("selected")

    setHeader(MenuItem.getElementsByTagName("span")[0].innerHTML)
}

function showNewEpisodes()
{
    clearContent()
    setHeaderViewAction()

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
                // var ListElement = getPodcastElement(null, Artwork, JsonContent[i].channelName, JsonContent[i].episodeTitle, s_DeleteIcon, JsonContent[i].duration)
                
                var ListElement = buildListItem(new cListElement
                (
                    [
                        getImagePart(Artwork),
                        getBoldTextPart(JsonContent[i].episodeTitle),
                        getSubTextPart((JsonContent[i].duration == undefined) ? "" : JsonContent[i].duration),
                        getTextPart(JsonContent[i].channelName),
                        getIconButtonPart(s_DeleteIcon)
                    ],
                    "5em 1fr 6em 1fr 5em"
                ), eLayout.row)

                // var ListElement = getPodcastElement(null, Artwork, JsonContent[i].channelName, JsonContent[i].episodeTitle, s_MoreOptionIcon)


                // Duration = (JsonContent[i].duration == undefined) ? "" : JsonContent[i].duration
                // var ListElement = buildListItem(new cListElement([getImagePart(Artwork), getBoldTextPart(JsonContent[i].episodeTitle), getSubTextPart(JsonContent[i].channelName), getSubTextPart(Duration), getIconButtonPart(s_DeleteIcon)], '5em 3fr 2fr 1fr 5em'), eLayout.row)
                ListElement.setAttribute("onclick", "playNow(this)")
                ListElement.setAttribute("channel", JsonContent[i].channelName)
                ListElement.setAttribute("title", JsonContent[i].episodeTitle)
                ListElement.setAttribute("type", JsonContent[i].episodeType)
                ListElement.setAttribute("url", JsonContent[i].episodeUrl)
                ListElement.setAttribute("length", JsonContent[i].episodeLength)
                ListElement.setAttribute("artworkUrl", Artwork)


                if (isPlaying(JsonContent[i].episodeUrl))
                {
                //     ListElement = getPodcastElement(null, Artwork, JsonContent[i].channelName, JsonContent[i].episodeTitle, s_PlayIcon)
                    ListElement.classList.add("select-episode")
                }

                var HeaderElement = ListElement.getElementsByClassName("podcast-entry-header")[0]

                // getListItemPart(ListElement, 1).addEventListener('click', playNow, 'bubble')
                // getListItemPart(ListElement, 1).setAttribute("onclick", "playNow(this)")
                // getListItemPart(ListElement, 1).setAttribute("type", JsonContent[i].episodeType)
                // getListItemPart(ListElement, 1).setAttribute("url", JsonContent[i].episodeUrl)
                // getListItemPart(ListElement, 1).setAttribute("length", JsonContent[i].episodeLength)
                // getListItemPart(ListElement, 1).setAttribute("artworkUrl", Artwork)

                // HeaderElement.setAttribute("onclick", "playNow(this)")
                // HeaderElement.setAttribute("type", JsonContent[i].episodeType)
                // HeaderElement.setAttribute("url", JsonContent[i].episodeUrl)
                // HeaderElement.setAttribute("length", JsonContent[i].episodeLength)
                // HeaderElement.setAttribute("artworkUrl", Artwork)

                List.append(ListElement)
            }
        }
    }
}

function showFavorites()
{
    clearContent()
    setHeaderViewAction("list")

    if (fs.existsSync(getSaveFilePath()) && fs.readFileSync(getSaveFilePath(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))

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
            // var ListElement

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
    setHeaderViewAction()

    if (fs.existsSync(getArchivedFilePath()) && fs.readFileSync(getArchivedFilePath(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(getArchivedFilePath(), "utf-8"))
        var List        = document.getElementById("list")

        setGridLayout(List, false)

        // NOTE: Show just the last 100 entries in History
        // TODO: The can be loaded after user interaction

        var Count = ((JsonContent.length <= 100) ? JsonContent.length : 100)

        for (var i = JsonContent.length - Count; i < JsonContent.length; i++)
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
                var ListElement = buildListItem(new cListElement
                (
                    [
                        getImagePart(Artwork),
                        getBoldTextPart(EpisodeTitle),
                        getSubTextPart(DateTime.toLocaleString())
                    ], 
                    '5em 3fr 1fr'
                ), eLayout.row)

                List.insertBefore(ListElement, List.childNodes[0])
            }
        }
    }
}

function showStatistics()
{
    clearContent()
    setHeaderViewAction()

    var JsonContent = null
    var List = document.getElementById("list")

    setGridLayout(List, false)

    List.append(getStatisticsElement("statistics-header", "Podcasts", null))

    // if (fs.existsSync(getSaveFilePath()) && fs.readFileSync(getSaveFilePath(), "utf-8") != "")

    if (fileExistsAndIsNotEmpty(getSaveFilePath()))
    {
        JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))

        List.append(getStatisticsElement("statistics-entry", "Favorite Podcasts",  JsonContent.length))
    }
    else
    {
        List.append(getStatisticsElement("statistics-entry", "Favorite Podcasts", 0))
    }

    if (fileExistsAndIsNotEmpty(getArchivedFilePath()))
    {
        JsonContent = JSON.parse(fs.readFileSync(getArchivedFilePath(), "utf-8"))

        List.append(getStatisticsElement("statistics-entry", "Last Podcast",  JsonContent[JsonContent.length - 1].channelName))
    }
    else
    {
        List.append(getStatisticsElement("statistics-entry", "Last Podcast",  "None"))
    }

    List.append(getStatisticsElement("statistics-header", "Episodes", null))

    if (fileExistsAndIsNotEmpty(getArchivedFilePath()))
    {
        List.append(getStatisticsElement("statistics-entry", "History Items",  JsonContent.length))
    }
    else
    {
        List.append(getStatisticsElement("statistics-entry", "History Items",  0))
    }

    if (fileExistsAndIsNotEmpty(getNewEpisodesSaveFilePath()))
    {
        JsonContent = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8"))

        List.append(getStatisticsElement("statistics-entry", "New Episodes",  JsonContent.length))
    }
    else
    {
        List.append(getStatisticsElement("statistics-entry", "New Episodes",  0))
    }

    List.append(getStatisticsElement("statistics-header", "Playlists", null))

    if (fileExistsAndIsNotEmpty(getPlaylistFilePath()))
    {
        JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), "utf-8"))

        List.append(getStatisticsElement("statistics-entry", "Playlists",  JsonContent.length))
    }
    else
    {
        List.append(getStatisticsElement("statistics-entry", "Playlists",  0))
    }
}
