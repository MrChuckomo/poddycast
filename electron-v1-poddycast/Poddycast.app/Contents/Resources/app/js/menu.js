const s_DeleteIcon =
`
<svg class="delete-icon" onclick="deleteEntry(this)" fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
</svg>
`

function selectMenuItem(_Self)
{
    clearSearchField(document.getElementById("search").getElementsByTagName("input")[0])

    clearMenuSelection()

    _Self.classList.add("selected")

    setHeader(_Self.getElementsByTagName("span")[0].innerHTML)
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
            var ListElement = getPodcastElement(getArtWorkFromChannelName(JsonContent[i].channelName), JsonContent[i].channelName, JsonContent[i].episodeTitle, s_DeleteIcon)

            ListElement.setAttribute("onclick", "playNow(this)")
            ListElement.setAttribute("type", JsonContent[i].episodeType)
            ListElement.setAttribute("url", JsonContent[i].episodeUrl)
            ListElement.setAttribute("length", JsonContent[i].episodeLength)

            List.append(ListElement)
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
            var ListElement = getPodcastElement(JsonContent[i].artworkUrl60, JsonContent[i].artistName, JsonContent[i].collectionName)

            ListElement.setAttribute("onclick", "playNow(this)")

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
            var ListElement  = getPodcastElement(Artwork, JsonContent[i].date, EpisodeTitle)

            List.insertBefore(ListElement, List.childNodes[0])
        }
    }
}
