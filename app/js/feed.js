
function readFeeds()
{
    // TODO: Save a file for each podcast including all episodes

    if (fs.readFileSync(getSaveFilePath(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))

        for (var i = 0; i < JsonContent.length; i++)
        {
            makeFeedRequest(JsonContent[i].feedUrl, saveLatestEpisode)
            // makeFeedRequest(getFeedProxyOptions(JsonContent[i].feedUrl), saveLatestEpisode)
        }
    }
}

function saveLatestEpisode(_Content, _eRequest, _Options)
{
    if (isContent302NotFound(_Content))
    {
        makeFeedRequest(getChangedFeed(_Options, _eRequest), saveLatestEpisode)
    }
    else
    {
        if (_Content.includes("<html>"))
        {
            // TODO: Check strange result content

            console.log(_Options);
            console.log(_Content);
        }
        else
        {
            // NOTE: Parse a real feed and just access the last element

            Parser = new DOMParser();
            xmlDoc = Parser.parseFromString(_Content,"text/xml");

            var ChannelName   = xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("title")[0].childNodes[0].nodeValue
            var EpisodeTitle  = xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("title")[0].childNodes[0].nodeValue
            var EpisodeLength = xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("enclosure")[0].getAttribute("length")
            var EpisodeType   = xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("enclosure")[0].getAttribute("type")
            var EpisodeUrl    = xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("enclosure")[0].getAttribute("url")

            // NOTE: save latest episode if not already in History

            if (getValueFromFile(getArchivedFilePath, "episodeUrl", "episodeUrl", EpisodeUrl) == null)
            {
                saveEpisode(ChannelName, EpisodeTitle, EpisodeUrl, EpisodeType, EpisodeLength)
            }
        }
    }
}

function showAllEpisodes(_Self)
{
    clearContent()

    getAllEpisodesFromFeed(_Self.getAttribute("feedurl"))
}

function getAllEpisodesFromFeed(_Feed)
{
    var PodcastName = getValueFromFile(getSaveFilePath, "collectionName", "feedUrl", _Feed)

    appendSettingsSection(PodcastName)

    makeFeedRequest(_Feed, checkContent)
    // makeFeedRequest(getFeedProxyOptions(_Feed), checkContent)
}

function checkContent(_Content, _eRequest, _Options)
{
    if (isContent302NotFound(_Content))
    {
        clearContent()
        getAllEpisodesFromFeed(getChangedFeed(_Options, _eRequest))
    }
    else
    {
        processEpisodes(_Content)
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// NOTE: Helper to clear corrupt feeds

function isContent302NotFound(_Content)
{
    return (_Content == "" || _Content.includes("302 Found"))
}

function getChangedFeed(_Feed, _eRequest)
{
    if (_Feed instanceof Object)
    {
        switch (_eRequest)
        {
            case eRequest.https: _Feed.path = _Feed.path.replace("https", "http"); break;
            case eRequest.http:  _Feed.path = _Feed.path.replace("http", "https"); break;
            default: break;
        }
    }
    else
    {
        switch (_eRequest)
        {
            case eRequest.https: _Feed = _Feed.replace("https", "http"); break;
            case eRequest.http:  _Feed = _Feed.replace("http", "https"); break;
            default: break;
        }
    }


    return _Feed
}

// ---------------------------------------------------------------------------------------------------------------------

function appendSettingsSection(_PodcastName)
{
    // NOTE: settings area in front of a podcast episode list

    var RightContent = document.getElementById("list")

    var SettingsDiv = document.createElement("div")
    SettingsDiv.classList.add("settings")

    var PodcastImage = document.createElement("img")
    PodcastImage.classList.add("settings-image")

    var podcastName = document.createElement("div")
    podcastName.classList.add("settings-header")

    var EpisodeCount = document.createElement("div")
    EpisodeCount.classList.add("settings-count")

    var MoreElement = document.createElement("div")
    MoreElement.innerHTML = s_MoreOptionIcon
    MoreElement.classList.add("settings-unsubscribe")

    // NOTE: set context menu

    setPodcastSettingsMenu(MoreElement, _PodcastName)

    // NOTE: build layout

    SettingsDiv.append(PodcastImage)
    SettingsDiv.append(podcastName)
    SettingsDiv.append(EpisodeCount)
    SettingsDiv.append(MoreElement)

    RightContent.append(SettingsDiv)
}

function setPodcastSettingsMenu(_Object, _PodcastName)
{
    const {remote} = require('electron')
    const {Menu, MenuItem} = remote

    const PlaylistMenu = new Menu()

    if (fs.existsSync(getPlaylistFilePath()) && fs.readFileSync(getPlaylistFilePath(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), "utf-8"))

        for (var i = 0; i < JsonContent.length; i++)
        {
            var IsInPlaylist = isAlreadyInPlaylist(JsonContent[i].playlistName, _PodcastName)

            PlaylistMenu.append(new MenuItem({label: JsonContent[i].playlistName, type: "checkbox", checked: IsInPlaylist, click(self)
            {
                var JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), "utf-8"))

                for (var i = 0; i < JsonContent.length; i++)
                {
                    if (self.label == JsonContent[i].playlistName)
                    {
                        var PodcastList = JsonContent[i].podcastList
                        var PodcastName = document.getElementsByClassName("settings-header")[0].innerHTML

                        if (isAlreadyInPlaylist(JsonContent[i].playlistName, PodcastName))
                        {
                            for (var j = PodcastList.length - 1; j >= 0 ; j--)
                            {
                                if(PodcastList[j] == PodcastName) { PodcastList.splice(j, 1) }
                            }
                        }
                        else
                        {
                            PodcastList.push(PodcastName)
                        }

                        break
                    }
                }

                fs.writeFileSync(getPlaylistFilePath(), JSON.stringify(JsonContent))
            }}))
        }
    }

    const ContextMenu = new Menu()
    ContextMenu.append(new MenuItem({label: 'Add to playlist', submenu: PlaylistMenu}))
    ContextMenu.append(new MenuItem({type: 'separator'}))
    ContextMenu.append(new MenuItem({label: 'Add to New Episodes', type: 'checkbox', checked: true }))
    ContextMenu.append(new MenuItem({type: 'separator'}))
    ContextMenu.append(new MenuItem({label: 'Unsubscribe', click() { console.log('unsubscribe') }}))

    _Object.addEventListener('click', (_Event) =>
    {
        _Event.preventDefault()
        ContextMenu.popup(remote.getCurrentWindow())
    }, false)

}

function processEpisodes(_Content)
{
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(_Content, "text/xml");

    // console.log(_Content);
    // console.log(xmlDoc);

    var ChannelName = xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("title")[0].childNodes[0].nodeValue
    var Artwork     = getValueFromFile(getSaveFilePath, "artworkUrl60", "collectionName", ChannelName)

    if (getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", ChannelName) != undefined && getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", ChannelName) != "undefined")
    {
        Artwork = getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", ChannelName)
    }

    // NOTE: set settings information

    // setHeader(ChannelName)
    document.getElementsByClassName("settings-image")[0].src = Artwork
    document.getElementsByClassName("settings-header")[0].innerHTML = ChannelName
    document.getElementsByClassName("settings-count")[0].innerHTML  = xmlDoc.getElementsByTagName("item").length

    var List = document.getElementById("list")

    for (var i = 0; i < xmlDoc.getElementsByTagName("item").length; i++)
    {
        var Item = xmlDoc.getElementsByTagName("item")[i]

        var EpisodeTitle  = Item.getElementsByTagName("title")[0].childNodes[0].nodeValue
        var EpisodeLength = Item.getElementsByTagName("enclosure")[0].getAttribute("length")
        var EpisodeType   = Item.getElementsByTagName("enclosure")[0].getAttribute("type")
        var EpisodeUrl    = Item.getElementsByTagName("enclosure")[0].getAttribute("url")

        if (Item.getElementsByTagName("duration").length > 0)
        {
            var Duration = parseFeedEpisodeDuration(Item.getElementsByTagName("duration")[0].innerHTML.split(":"))

            if (Duration.hours == 0 && Duration.minutes == 0) { Duration = "" }
            else                                              { Duration = Duration.hours + "h " + Duration.minutes + "min" }
        }
        else
        {
            var Duration = ""
        }

        var ListElement = getPodcastElement("podcast-entry", null, Duration, EpisodeTitle, s_AddEpisodeIcon, "podcast-episode-header")

        if (isEpisodeAlreadySaved(EpisodeTitle))
        {
            ListElement = getPodcastElement("podcast-entry", null, Duration, EpisodeTitle, null, "podcast-episode-header")
        }

        if (isPlaying(EpisodeUrl))
        {
            // ListElement = getPodcastElement("podcast-entry", null, Time.getHours() + "h " + Time.getMinutes() + "min", EpisodeTitle, s_PlayIcon, "podcast-episode-header")
            ListElement.classList.add("select-episode")
        }

        // NOTE: Set a episode item to "Done if it is in the History file"

        if (getValueFromFile(getArchivedFilePath, "episodeUrl", "episodeUrl", EpisodeUrl) != null)
        {
            setPodcastElementToDone(ListElement)
        }

        var HeaderElement = ListElement.getElementsByClassName("podcast-episode-header")[0]

        HeaderElement.setAttribute("onclick", "playNow(this)")
        HeaderElement.setAttribute("channel", ChannelName)
        HeaderElement.setAttribute("title", EpisodeTitle)
        HeaderElement.setAttribute("type", EpisodeType)
        HeaderElement.setAttribute("url", EpisodeUrl)
        HeaderElement.setAttribute("length", EpisodeLength)
        HeaderElement.setAttribute("artworkUrl", Artwork)

        List.append(ListElement)
    }
}

function addToEpisodes(_Self)
{
    var ListElement = _Self.parentElement.parentElement.getElementsByClassName("podcast-episode-header")[0]

    saveEpisode(ListElement.getAttribute("channel"), ListElement.getAttribute("title"), ListElement.getAttribute("url"), ListElement.getAttribute("type"), ListElement.getAttribute("length"))

    _Self.innerHTML = ""
}

function saveEpisode(_ChannelName, _EpisodeTitle, _EpisodeUrl, _EpisodeType, _EpisodeLength)
{
    var Feed =
    {
        "channelName": _ChannelName,
        "episodeTitle": _EpisodeTitle,
        "episodeUrl": _EpisodeUrl,
        "episodeType": _EpisodeType,
        "episodeLength": _EpisodeLength,
        "playbackPosition": 0,
    }

    var JsonContent = []

    if (fs.existsSync(getNewEpisodesSaveFilePath()) && fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8") != "")
    {
        JsonContent = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8"))
    }
    else
    {
        fs.writeFileSync(getNewEpisodesSaveFilePath(), JSON.stringify(JsonContent))
    }

    if (!isEpisodeAlreadySaved(_EpisodeTitle))
    {
        JsonContent.push(Feed)
    }

    fs.writeFileSync(getNewEpisodesSaveFilePath(), JSON.stringify(JsonContent))

    setItemCounts()
}
