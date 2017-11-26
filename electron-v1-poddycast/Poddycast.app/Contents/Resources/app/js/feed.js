
function readFeeds()
{
    // TODO: read all Feeds
    // TODO: distinguish between http and https
    // TODO: compare existing episodes with new
    // TODO: if new episodes add to the json file
    // TODO: json file can be used to diplay "New Episodes" menu item
    // TODO: find actual mp3 file
    // TODO: save a file for each podcast including all episodes

    if (fs.readFileSync(getSaveFilePath(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))

        // console.log(fs.readFile("http://teenagersexbeichte.de/feed/tsbfeed/", "utf-8"));


        for (var i = 0; i < JsonContent.length; i++)
        {
            // var req = http.request("http://teenagersexbeichte.de/feed/tsbfeed/", function(res)

            if (JsonContent[i].feedUrl.includes("https"))
            {
                var req = https.request(JsonContent[i].feedUrl, function(res)
                {
                    var Content = ""

                    res.setEncoding("utf8");

                    res.on("data", function (chunk) { Content += chunk })
                    res.on("end",  function ()      { saveLatestEpisode(Content) })
                });
            }
            else
            {
                var req = http.request(JsonContent[i].feedUrl, function(res)
                {
                    var Content = ""

                    res.setEncoding("utf8");

                    res.on("data", function (chunk) { Content += chunk })
                    res.on("end",  function ()      { saveLatestEpisode(Content) })
                });
            }

            req.on('error', function(_Event) { console.log('problem with request: ' + _Event.message) })

            req.end();
        }
    }
}

function saveLatestEpisode(_Content)
{
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(_Content,"text/xml");

    var ChannelName   = xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("title")[0].childNodes[0].nodeValue
    var EpisodeTitle  = xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("title")[0].childNodes[0].nodeValue
    var EpisodeLength = xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("enclosure")[0].getAttribute("length")
    var EpisodeType   = xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("enclosure")[0].getAttribute("type")
    var EpisodeUrl    = xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("enclosure")[0].getAttribute("url")

    saveEpisode(ChannelName, EpisodeTitle, EpisodeUrl, EpisodeType, EpisodeLength)
}

function showAllEpisodes(_Self)
{
    clearContent()

    getAllEpisodesFromFeed(_Self.getAttribute("feedurl"))
}

function getAllEpisodesFromFeed(_Feed)
{
    // TODO: hide add button after clicking it

    var PodcastName = getValueFromFile(getSaveFilePath, "collectionName", "feedUrl", _Feed)

    appendSettingsSection(PodcastName)

    if (_Feed.includes("https"))
    {
        var req = https.request(_Feed, function(res)
        {
            var Content = ""

            res.setEncoding('utf8')

            res.on("data", function (chunk) { Content += chunk })
            res.on("end",  function ()      { processEpisodes(Content) })
        });
    }
    else
    {
        var req = http.request(_Feed, function(res)
        {
            var Content = ""

            res.setEncoding('utf8')

            res.on("data", function (chunk) { Content += chunk })
            res.on("end",  function ()      { processEpisodes(Content) })
        });
    }

    req.on('error', function(_Event) { console.log('problem with request: ' + _Event.message) })

    req.end();
}

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
    xmlDoc = parser.parseFromString(_Content,"text/xml");

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

        var Time = new Date()

        Time.setMilliseconds(EpisodeLength)

        var ListElement = getPodcastElement("podcast-episode-entry", null, Time.getHours() + "h " + Time.getMinutes() + "min", EpisodeTitle, s_AddEpisodeIcon)

        if (isEpisodeAlreadySaved(EpisodeTitle))
        {
            ListElement = getPodcastElement("podcast-episode-entry", null, Time.getHours() + "h " + Time.getMinutes() + "min", EpisodeTitle)
        }

        if (isPlaying(EpisodeUrl))
        {
            ListElement = getPodcastElement("podcast-episode-entry", null, Time.getHours() + "h " + Time.getMinutes() + "min", EpisodeTitle, s_PlayIcon)
        }

        ListElement.setAttribute("onclick", "playNow(this)")
        ListElement.setAttribute("channel", ChannelName)
        ListElement.setAttribute("title", EpisodeTitle)
        ListElement.setAttribute("type", EpisodeType)
        ListElement.setAttribute("url", EpisodeUrl)
        ListElement.setAttribute("length", EpisodeLength)

        List.append(ListElement)
    }
}

function addToEpisodes(_Self)
{
    var ListElement = _Self.parentElement

    saveEpisode(ListElement.getAttribute("channel"), ListElement.getAttribute("title"), ListElement.getAttribute("url"), ListElement.getAttribute("type"), ListElement.getAttribute("length"))
}

function saveEpisode(_ChannelName, _EpisodeTitle, _EpisodeUrl, _EpisodeType, _EpisodeLength)
{
    if (getValueFromFile(getArchivedFilePath, "episodeUrl", "episodeUrl", _EpisodeUrl) == null)
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
    }
}
