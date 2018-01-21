
// ---------------------------------------------------------------------------------------------------------------------
// RIGHT COLUMN
// ---------------------------------------------------------------------------------------------------------------------

function clearContent()
{
    // document.getElementById("res").innerHTML = ""
    document.getElementById("list").innerHTML = ""
}

function clearListSelection()
{
    var ListItems = document.getElementById("list").getElementsByTagName("li")

    for (var i = 0; i < ListItems.length; i++)
    {
        ListItems[i].classList.remove("select-episode")
    }
}

function setHeader(_Title)
{
    var Header = document.getElementById("content-right").getElementsByTagName("h1")[0]

    Header.innerHTML = _Title
}

function unsubscribeListElement(_Self)
{
    var ListElement = _Self.parentElement.parentElement;
    var PodcastName = ListElement.getElementsByClassName("podcast-entry-header")[0].getElementsByClassName("podcast-entry-title")[0].innerHTML
    var FeedUrl     = ListElement.getElementsByClassName("podcast-entry-header")[0].getAttribute("feedUrl")

    // NOTE: Remove optically

    ListElement.parentElement.removeChild(ListElement)

    // NOTE: Remove from files

    removeFromFile(getNewEpisodesSaveFilePath, "channelName", PodcastName, false)
    removeFromFile(getSaveFilePath, "feedUrl", FeedUrl, true)

    setItemCounts()
}

function unsubscribeContextMenu(_PodcastName, _FeedUrl)
{
    // NOTE: Support context menu unsubscribe

    removeFromFile(getNewEpisodesSaveFilePath, "channelName", _PodcastName, false)
    removeFromFile(getSaveFilePath, "feedUrl", _FeedUrl, true)

    selectMenuItem("menu-favorites")
    showFavorites()
    setItemCounts()
}

function removeFromFile(_File, _ContentReference, _Value, _Break)
{
    if (fs.readFileSync(_File(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(_File(), "utf-8"))

        for (var i = JsonContent.length - 1; i >= 0 ; i--)
        {
            if (_Value == JsonContent[i][_ContentReference])
            {
                JsonContent.splice(i, 1)

                if (_Break) { break }
            }
        }

        fs.writeFileSync(_File(), JSON.stringify(JsonContent))
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// PODCAST ENTRY
// ---------------------------------------------------------------------------------------------------------------------

function getPodcastElement(_Class, _Artwork, _Subtitle, _Title, _IconElement, _HeaderLayout)
{
    var ListElement     = document.createElement("li")
    var HeaderElement   = document.createElement("div")
    var ActionsElement  = document.createElement("div")
    var BodyElement     = document.createElement("div")

    var TitleElement    = document.createElement("div")
    var SubtitleElement = document.createElement("div")
    var ImageElement    = document.createElement("img")


    if (_HeaderLayout == null)
    {
        HeaderElement.classList.add("podcast-entry-header")
    }
    else
    {
        HeaderElement.classList.add(_HeaderLayout)
    }

    ActionsElement.classList.add("podcast-entry-actions")
    BodyElement.classList.add("podcast-entry-body")

    ImageElement.src = _Artwork

    TitleElement.innerHTML = _Title
    TitleElement.classList.add("podcast-entry-title")

    SubtitleElement.innerHTML = _Subtitle
    SubtitleElement.classList.add("podcast-entry-subtitle")

    ListElement.classList.add("podcast-entry")

    if (_Class       != null)      { ListElement.classList.remove("podcast-entry"); ListElement.classList.add(_Class) }
    if (_IconElement != undefined) { ActionsElement.innerHTML = _IconElement }
    if (_Artwork     != null)      { HeaderElement.append(ImageElement) }

    if (_Subtitle != null) { HeaderElement.append(SubtitleElement)}

    // ListElement.append(TitleElement)

    HeaderElement.append(TitleElement)

    ListElement.append(HeaderElement)
    ListElement.append(ActionsElement)
    ListElement.append(BodyElement)

    // ListElement.append(SubtitleElement)

    return ListElement
}

function getStatisticsElement(_Class, _Title, _Value)
{
    var ListElement = document.createElement("li")
    var Title = document.createElement("div")
    var Value = document.createElement("div")

    Title.innerHTML = _Title
    Title.classList.add("statistics-entry-title")

    if (_Value != null)
    {
        Value.innerHTML = _Value
        Value.classList.add("statistics-entry-value")
    }

    // ListElement.classList.add("statistics-entry")

    ListElement.classList.add(_Class)
    ListElement.append(Title)

    if (_Value != null)
    {
        ListElement.append(Value)
    }

    return ListElement
}

function setPodcastElementToDone(_ListElement)
{
    _ListElement.getElementsByClassName("podcast-entry-title")[0].classList.add("done")
}

function deleteEntryWithIcon(_Self)
{
    deleteEntry(_Self.parentElement.parentElement)
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

        deleteFromListView(_ListElement)

        // NOTE: Remove from JSON file and overwrite the file

        deleteFromFile(_ListElement.getElementsByClassName("podcast-entry-header")[0].getAttribute("url"))

        setItemCounts()
    }
}

function deleteFromListView(_ListElement)
{
    _ListElement.parentElement.removeChild(_ListElement)
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

    fs.writeFileSync(getNewEpisodesSaveFilePath(), JSON.stringify(JsonContent))
}

// ---------------------------------------------------------------------------------------------------------------------
// Sort And Filter
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
