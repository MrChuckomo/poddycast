function selectMenuItem(_Self)
{
    clearSearchField(document.getElementById("search").getElementsByTagName("input")[0])

    clearMenuSelection()

    _Self.classList.add("selected")

    setHeader(_Self.innerHTML)
}

function showNewEpisodes()
{
    if (fs.existsSync(getNewEpisodesSaveFilePath()))
    {
        var JsonContent = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8"))

        clearContent()

        var List = document.getElementById("list")

        for (var i = 0; i < JsonContent.length; i++)
        {
            var ListElement = getPodcastElement(getArtWorkFromChannelName(JsonContent[i].channelName), JsonContent[i].channelName, JsonContent[i].episodeTitle)

            ListElement.setAttribute("onclick", "playNow(this)")
            ListElement.setAttribute("type", JsonContent[i].episodeType)
            ListElement.setAttribute("url", JsonContent[i].episodeUrl)
            ListElement.setAttribute("length", JsonContent[i].episodeLength)

            List.append(ListElement)
        }
    }
}
