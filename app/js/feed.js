var CContentHelper = require('./js/helper/content')
var CPlayer        = require('./js/helper/player')

var helper = new CContentHelper()
var player = new CPlayer()


function readFeeds()
{
    // TODO: Save a file for each podcast including all episodes

    // Add animation to notify the user about fetching new episodes
    document.querySelector('#menu-refresh svg').classList.add('is-refreshing')

    if (fs.readFileSync(getSaveFilePath(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))

        for (var i = 0; i < JsonContent.length; i++)
        {
            if (isProxySet())
            {
                makeFeedRequest(getFeedProxyOptions(JsonContent[i].feedUrl), saveLatestEpisode)

                // Remove animation to notify the user about fetching new episodes.
                // Let the animation take at least 2 seconds. Otherwise user may not notice it.
                setTimeout(() => {document.querySelector('#menu-refresh svg').classList.remove('is-refreshing')}, 2000)
            }
            else
            {
                makeFeedRequest(JsonContent[i].feedUrl, saveLatestEpisode)

                // Remove animation to notify the user about fetching new episodes.
                // Let the animation take at least 2 seconds. Otherwise user may not notice it.
                setTimeout(() => {document.querySelector('#menu-refresh svg').classList.remove('is-refreshing')}, 2000)
            }
        }
    }
}

function saveLatestEpisode(_Content, _eRequest, _Options)
{
    var FeedUrl = _Options

    if (_Options instanceof Object)
    {
        FeedUrl = _Options.path
    }

    // NOTE: Fetch the new episode only if it is not disabled in the podcast settings

    if (getSettings(FeedUrl))
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

                // console.log(_Options);
                // console.log(_Content);
            }
            else
            {
                // NOTE: Parse a real feed and just access the last element

                Parser = new DOMParser();
                xmlDoc = Parser.parseFromString(_Content,"text/xml");

                var ChannelName   = xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("title")[0].childNodes[0].nodeValue
                var EpisodeTitle  = xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("title")[0].childNodes[0].nodeValue
                var EpisodeLength = xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("enclosure")[0] !== undefined ? xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("enclosure")[0].getAttribute("length") : ''
                var EpisodeType   = xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("enclosure")[0] !== undefined ? xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("enclosure")[0].getAttribute("type") : ''
                var EpisodeUrl    = xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("enclosure")[0] !== undefined ? xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("enclosure")[0].getAttribute("url") : ''
                var DurationKey   = ((xmlDoc.getElementsByTagName("itunes:duration").length == 0) ? "duration" : "itunes:duration")

                if (xmlDoc.getElementsByTagName(DurationKey).length > 0)
                {
                    var Duration = parseFeedEpisodeDuration(xmlDoc.getElementsByTagName(DurationKey)[0].innerHTML.split(":"))

                    if (Duration.hours == 0 && Duration.minutes == 0) { Duration = "" }
                    else                                              { Duration = Duration.hours + "h " + Duration.minutes + "min" }
                }
                else
                {
                    var Duration = ""
                }

                // NOTE: save latest episode if not already in History

                if (getValueFromFile(getArchivedFilePath, "episodeUrl", "episodeUrl", EpisodeUrl) == null)
                {
                    saveEpisode(ChannelName, EpisodeTitle, EpisodeUrl, EpisodeType, EpisodeLength, Duration)
                }
            }
        }
    }
}

function showAllEpisodes(_Self)
{
    setGridLayout(document.getElementById("list"), false)

    helper.clearContent()
    setHeaderViewAction()

    getAllEpisodesFromFeed(_Self.getAttribute("feedurl"))
}

function getAllEpisodesFromFeed(_Feed)
{
    var PodcastName = getValueFromFile(getSaveFilePath, "collectionName", "feedUrl", _Feed)

    appendSettingsSection(PodcastName, _Feed)

    if (isProxySet())
    {
        if (_Feed instanceof Object)
        {
            makeFeedRequest(_Feed, checkContent)
        }
        else
        {
            makeFeedRequest(getFeedProxyOptions(_Feed), checkContent)
        }
    }
    else
    {
        makeFeedRequest(_Feed, checkContent)
    }
}

function checkContent(_Content, _eRequest, _Options)
{
    if (isContent302NotFound(_Content))
    {
        helper.clearContent()
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
        var Path = _Feed.path.toString()

        if      (Path.includes("http" )) { _Feed.path = Path.replace("http", "https") }
        else if (Path.includes("https")) { _Feed.path = Path.replace("https", "http") }
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

function appendSettingsSection(_PodcastName, _Feed)
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

    setPodcastSettingsMenu(MoreElement, _PodcastName, _Feed)

    // NOTE: build layout

    SettingsDiv.append(PodcastImage)
    SettingsDiv.append(podcastName)
    SettingsDiv.append(EpisodeCount)
    SettingsDiv.append(MoreElement)

    RightContent.append(SettingsDiv)
}

function setPodcastSettingsMenu(_Object, _PodcastName, _Feed)
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
    ContextMenu.append(new MenuItem({label: i18n.__('Add to playlist'), submenu: PlaylistMenu}))
    ContextMenu.append(new MenuItem({type: 'separator'}))
    ContextMenu.append(new MenuItem({label: i18n.__('Push to New Episodes'), type: 'checkbox', checked: getSettings(_Feed), click(self)
    {
        if (isInSettings(_Feed))
        {
            changeSettings(_Feed, self.checked)
        }
        else
        {
            addToSettings(_PodcastName, _Feed)
            changeSettings(_Feed, self.checked)
        }
    }}))
    ContextMenu.append(new MenuItem({type: 'separator'}))
    ContextMenu.append(new MenuItem({label: i18n.__('Unsubscribe'), click()
    {
        if (_PodcastName != null) { unsubscribeContextMenu(_PodcastName, _Feed) }
    }}))

    _Object.addEventListener('click', (_Event) =>
    {
        _Event.preventDefault()
        ContextMenu.popup(remote.getCurrentWindow(), { async:true })
    }, false)

}

function processEpisodes(_Content)
{
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(_Content, "text/xml");

    var ChannelName = xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("title")[0].childNodes[0].nodeValue
    var Artwork     = getValueFromFile(getSaveFilePath, "artworkUrl60", "collectionName", ChannelName)

    if (getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", ChannelName) != undefined && getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", ChannelName) != "undefined")
    {
        Artwork = getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", ChannelName)
    } else if (xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("media:thumbnail")[0] !== undefined) {
        Artwork = xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("media:thumbnail")[0].getAttribute("url")
    } else if (xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("itunes:image")[0] !== undefined) {
        Artwork = xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("itunes:image")[0].getAttribute("href")
    } else {
        // Find any element with 'href' or 'url' attribute containing an image (podcast thumbnail)
        for (var i = 0; i < xmlDoc.getElementsByTagName("channel").length; i++) {
            if (xmlDoc.getElementsByTagName("channel")[i].querySelector("*[href*='.jpeg'], *[href*='.jpg'], *[href*='.png']").length !== 0) {
                Artwork = xmlDoc.getElementsByTagName("channel")[i].querySelector("*[href*='.jpeg'], *[href*='.jpg'], *[href*='.png']").getAttribute('href')
            } else if (xmlDoc.getElementsByTagName("channel")[i].querySelector("*[url*='.jpeg'], *[url*='.jpg'], *[url*='.png']").length !== 0) {
                Artwork = xmlDoc.getElementsByTagName("channel")[i].querySelector("*[href*='.jpeg'], *[href*='.jpg'], *[href*='.png']").getAttribute('url')
            }
        }
    }

    // NOTE: set settings information

    document.getElementsByClassName("settings-image")[0].src = Artwork
    document.getElementsByClassName("settings-header")[0].innerHTML = ChannelName
    document.getElementsByClassName("settings-count")[0].innerHTML  = xmlDoc.getElementsByTagName("item").length

    var List = document.getElementById("list")

    for (var i = 0; i < xmlDoc.getElementsByTagName("item").length; i++)
    {
        var Item = xmlDoc.getElementsByTagName("item")[i]

        // NOTE: Just enter if the current item contains an enclosure tag

        if (Item.getElementsByTagName("enclosure").length > 0)
        {
            var EpisodeTitle  = Item.getElementsByTagName("title")[0].childNodes[0].nodeValue
            var EpisodeLength = Item.getElementsByTagName("enclosure")[0].getAttribute("length")
            var EpisodeType   = Item.getElementsByTagName("enclosure")[0].getAttribute("type")
            var EpisodeUrl    = Item.getElementsByTagName("enclosure")[0].getAttribute("url")
            var PubDate       = Item.getElementsByTagName("pubDate")[0].childNodes[0].nodeValue
            var DurationKey   = ((Item.getElementsByTagName("itunes:duration").length == 0) ? "duration" : "itunes:duration")

            if ((Item.getElementsByTagName(DurationKey).length > 0))
            {
                var Duration = parseFeedEpisodeDuration(Item.getElementsByTagName(DurationKey)[0].innerHTML.split(":"))

                if (Duration.hours == 0 && Duration.minutes == 0) { Duration = "" }
                else                                              { Duration = Duration.hours + "h " + Duration.minutes + "min" }
            }
            else
            {
                var Duration = ""
            }

            var ListElement = buildListItem(new cListElement
            (
                [
                    getBoldTextPart(EpisodeTitle),
                    getSubTextPart(new Date(PubDate).toLocaleString()),
                    getSubTextPart(Duration),
                    getFlagPart('Done', 'white', '#4CAF50'),
                    getIconButtonPart(s_AddEpisodeIcon)
                ],
                "3fr 1fr 1fr 5em 5em"
            ), eLayout.row)

            if (isEpisodeAlreadySaved(EpisodeTitle))
            {
                ListElement.replaceChild(getIconButtonPart(''), ListElement.children[4])
            }

            if (player.isPlaying(EpisodeUrl))
            {
                ListElement.classList.add("select-episode")
            }

            // NOTE: Set a episode item to "Done" if it is in the History file

            if (getValueFromFile(getArchivedFilePath, "episodeUrl", "episodeUrl", EpisodeUrl) == null)
            {
                ListElement.replaceChild(getIconButtonPart(''), ListElement.children[3])
            }

            ListElement.setAttribute("onclick", "playNow(this)")
            ListElement.setAttribute("channel", ChannelName)
            ListElement.setAttribute("title", EpisodeTitle)
            ListElement.setAttribute("type", EpisodeType)
            ListElement.setAttribute("url", EpisodeUrl)
            ListElement.setAttribute("length", EpisodeLength)
            ListElement.setAttribute("duration", Duration)
            ListElement.setAttribute("artworkUrl", Artwork)

            List.append(ListElement)
        }
    }
}

function addToEpisodes(_Self)
{
    var ListElement = _Self.parentElement.parentElement

    saveEpisode(ListElement.getAttribute("channel"), ListElement.getAttribute("title"), ListElement.getAttribute("url"), ListElement.getAttribute("type"), ListElement.getAttribute("length"), ListElement.getAttribute("duration"))

    _Self.innerHTML = ""
}

function saveEpisode(_ChannelName, _EpisodeTitle, _EpisodeUrl, _EpisodeType, _EpisodeLength, _Duration)
{
    var Feed =
    {
        "channelName": _ChannelName,
        "episodeTitle": _EpisodeTitle,
        "episodeUrl": _EpisodeUrl,
        "episodeType": _EpisodeType,
        "episodeLength": _EpisodeLength,
        "duration": _Duration,
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
