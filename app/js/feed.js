'use strict'

var CContentHelper = require('./js/helper/content')
var CPlayer = require('./js/helper/player')

var helper = new CContentHelper()
var player = new CPlayer()


function readFeeds() {
    // TODO: Save a file for each podcast including all episodes

    // Add animation to notify the user about fetching new episodes
    document.querySelector('#menu-refresh svg').classList.add('is-refreshing')

    if (fs.readFileSync(getSaveFilePath(), 'utf-8') !== '') {
        let JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), 'utf-8'))

        for (let i = 0; i < JsonContent.length; i++) {
            if (isProxySet()) {
                makeFeedRequest(getFeedProxyOptions(JsonContent[i].feedUrl), saveLatestEpisode)

                // Remove animation to notify the user about fetching new episodes.
                // Let the animation take at least 2 seconds. Otherwise user may not notice it.
                setTimeout(() => {
                    document.querySelector('#menu-refresh svg').classList.remove('is-refreshing')
                }, 2000)
            } else {
                makeFeedRequest(JsonContent[i].feedUrl, saveLatestEpisode)

                // Remove animation to notify the user about fetching new episodes.
                // Let the animation take at least 2 seconds. Otherwise user may not notice it.
                setTimeout(() => {
                    document.querySelector('#menu-refresh svg').classList.remove('is-refreshing')
                }, 2000)
            }
        }
    }
}

function saveLatestEpisode(_Content, _eRequest, _Options) {
    let FeedUrl = _Options

    if (_Options instanceof Object) {
        FeedUrl = _Options.path
    }

    // NOTE: Fetch the new episode only if it is not disabled in the podcast settings

    if (isAddedToInbox(FeedUrl)) {
        if (isContent302NotFound(_Content)) {
            makeFeedRequest(getChangedFeed(_Options, _eRequest), saveLatestEpisode)
        } else {
            if (_Content.includes('<html>')) {
                // TODO: Check strange result content

                // console.log(_Options);
                // console.log(_Content);
            } else {
                // NOTE: Parse a real feed and just access the last element

                let Parser = new DOMParser();
                let xmlDoc = Parser.parseFromString(_Content, 'text/xml');

                let ChannelName = xmlDoc.getElementsByTagName('channel')[0].getElementsByTagName('title')[0].childNodes[0].nodeValue
                let EpisodeTitle = xmlDoc.getElementsByTagName('item')[0].getElementsByTagName('title')[0].childNodes[0].nodeValue
                let EpisodeLength = xmlDoc.getElementsByTagName('item')[0].getElementsByTagName('enclosure')[0] !== undefined ? xmlDoc.getElementsByTagName('item')[0].getElementsByTagName('enclosure')[0].getAttribute('length') : ''
                let EpisodeType = xmlDoc.getElementsByTagName('item')[0].getElementsByTagName('enclosure')[0] !== undefined ? xmlDoc.getElementsByTagName('item')[0].getElementsByTagName('enclosure')[0].getAttribute('type') : ''
                let EpisodeUrl = xmlDoc.getElementsByTagName('item')[0].getElementsByTagName('enclosure')[0] !== undefined ? xmlDoc.getElementsByTagName('item')[0].getElementsByTagName('enclosure')[0].getAttribute('url') : ''
                let EpisodeDescription = xmlDoc.getElementsByTagName('item')[0].getElementsByTagName('itunes:subtitle')[0] !== undefined ? xmlDoc.getElementsByTagName('item')[0].getElementsByTagName('itunes:subtitle')[0].textContent : xmlDoc.getElementsByTagName('item')[0].getElementsByTagName('description')[0].textContent
                let DurationKey = ((xmlDoc.getElementsByTagName('itunes:duration').length === 0) ? 'duration' : 'itunes:duration')


                var Duration = ""
                if (xmlDoc.getElementsByTagName(DurationKey).length > 0)
                {
                    var Duration = parseFeedEpisodeDuration(xmlDoc.getElementsByTagName(DurationKey)[0].innerHTML.split(":"))

                    if (Duration.hours == 0 && Duration.minutes == 0) { Duration = "" }
                    else if (Duration != null)
                    {                        
                        Duration = (Duration.hours != "0" ? Duration.hours + "h " : "") + Duration.minutes + "min"
                    }
                }

                // NOTE: save latest episode if not already in History

                if (getValueFromFile(getArchivedFilePath, 'episodeUrl', 'episodeUrl', EpisodeUrl) === null) {
                    saveEpisode(ChannelName, EpisodeTitle, EpisodeUrl, EpisodeType, EpisodeLength, EpisodeDescription, Duration)
                }
            }
        }
    }
}

function showAllEpisodes(_Self) {
    setGridLayout(document.getElementById('list'), false)

    helper.clearContent()
    setHeaderViewAction()

    getAllEpisodesFromFeed(_Self.getAttribute('feedurl'))
}

function getAllEpisodesFromFeed(_Feed) {
    let PodcastName = getValueFromFile(getSaveFilePath, 'collectionName', 'feedUrl', _Feed)

    appendSettingsSection(PodcastName, _Feed)

    if (isProxySet()) {
        if (_Feed instanceof Object) {
            makeFeedRequest(_Feed, checkContent)
        } else {
            makeFeedRequest(getFeedProxyOptions(_Feed), checkContent)
        }
    } else {
        makeFeedRequest(_Feed, checkContent)
    }
}

function checkContent(_Content, _eRequest, _Options) {
    if (isContent302NotFound(_Content)) {
        helper.clearContent()
        getAllEpisodesFromFeed(getChangedFeed(_Options, _eRequest))
    } else {
        processEpisodes(_Content)
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// NOTE: Helper to clear corrupt feeds

function isContent302NotFound(_Content) {
    return (_Content === '' || _Content.includes('302 Found'))
}

function getChangedFeed(_Feed, _eRequest) {
    if (_Feed instanceof Object) {
        let Path = _Feed.path.toString()

        if (Path.includes('http' )) {
            _Feed.path = Path.replace('http', 'https')
        } else if (Path.includes('https')) {
            _Feed.path = Path.replace('https', 'http')
        }
    } else {
        switch (_eRequest) {
        case eRequest.https: _Feed = _Feed.replace('https', 'http'); break;
        case eRequest.http: _Feed = _Feed.replace('http', 'https'); break;
        default: break;
        }
    }


    return _Feed
}

// ---------------------------------------------------------------------------------------------------------------------

function appendSettingsSection(_PodcastName, _Feed) {
    // NOTE: settings area in front of a podcast episode list

    let RightContent = document.getElementById('list')

    let SettingsDiv = document.createElement('div')
    SettingsDiv.classList.add('settings')

    let PodcastImage = document.createElement('img')
    PodcastImage.classList.add('settings-image')

    let podcastName = document.createElement('div')
    podcastName.classList.add('settings-header')

    let EpisodeCount = document.createElement('div')
    EpisodeCount.classList.add('settings-count')

    let MoreElement = document.createElement('div')
    MoreElement.innerHTML = s_MoreOptionIcon
    MoreElement.classList.add('settings-unsubscribe')

    // NOTE: set context menu

    setPodcastSettingsMenu(MoreElement, _PodcastName, _Feed)

    // NOTE: build layout

    SettingsDiv.append(PodcastImage)
    SettingsDiv.append(podcastName)
    SettingsDiv.append(EpisodeCount)
    SettingsDiv.append(MoreElement)

    RightContent.append(SettingsDiv)
}

function setPodcastSettingsMenu(_Object, _PodcastName, _Feed) {
    const {remote} = require('electron')
    const {Menu, MenuItem} = remote
    const PlaylistMenu = new Menu()

    if (fs.existsSync(getPlaylistFilePath()) && fs.readFileSync(getPlaylistFilePath(), 'utf-8') !== '') {
        let JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), 'utf-8'))

        for (let i = 0; i < JsonContent.length; i++) {
            let IsInPlaylist = isAlreadyInPlaylist(JsonContent[i].playlistName, _PodcastName)

            PlaylistMenu.append(new MenuItem({
                checked: IsInPlaylist,
                click(self) {
                    let JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), 'utf-8'))

                    for (let i = 0; i < JsonContent.length; i++) {
                        if (self.label === JsonContent[i].playlistName) {
                            let PodcastList = JsonContent[i].podcastList
                            let PodcastName = document.getElementsByClassName('settings-header')[0].innerHTML

                            if (isAlreadyInPlaylist(JsonContent[i].playlistName, PodcastName)) {
                                for (let j = PodcastList.length - 1; j >= 0; j--) {
                                    if (PodcastList[j] === PodcastName) {
                                        PodcastList.splice(j, 1)
                                    }
                                }
                            } else {
                                PodcastList.push(PodcastName)
                            }

                            break
                        }
                    }

                    fs.writeFileSync(getPlaylistFilePath(), JSON.stringify(JsonContent))
                },
                label: JsonContent[i].playlistName,
                type: 'checkbox'
            }))
        }
    }

    const ContextMenu = new Menu()
    ContextMenu.append(new MenuItem({label: i18n.__('Add to playlist'), submenu: PlaylistMenu}))
    ContextMenu.append(new MenuItem({type: 'separator'}))
    ContextMenu.append(new MenuItem({label: i18n.__('Push to New Episodes'), type: 'checkbox', checked: isAddedToInbox(_Feed), click(self)
    {
        setIsAddedToInbox(_Feed, self.checked)
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

function processEpisodes(_Content) {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(_Content, 'text/xml');
    let ChannelName = xmlDoc.getElementsByTagName('channel')[0].getElementsByTagName('title')[0].childNodes[0].nodeValue
    let Artwork = getValueFromFile(getSaveFilePath, 'artworkUrl60', 'collectionName', ChannelName)

    if (getValueFromFile(getSaveFilePath, 'artworkUrl100', 'collectionName', ChannelName) !== undefined && getValueFromFile(getSaveFilePath, 'artworkUrl100', 'collectionName', ChannelName) !== 'undefined') {
        Artwork = getValueFromFile(getSaveFilePath, 'artworkUrl100', 'collectionName', ChannelName)
    } else if (xmlDoc.getElementsByTagName('channel')[0].getElementsByTagName('media:thumbnail')[0] !== undefined) {
        Artwork = xmlDoc.getElementsByTagName('channel')[0].getElementsByTagName('media:thumbnail')[0].getAttribute('url')
    } else if (xmlDoc.getElementsByTagName('channel')[0].getElementsByTagName('itunes:image')[0] !== undefined) {
        Artwork = xmlDoc.getElementsByTagName('channel')[0].getElementsByTagName('itunes:image')[0].getAttribute('href')
    } else {
        // Find any element with 'href' or 'url' attribute containing an image (podcast thumbnail)
        for (let i = 0; i < xmlDoc.getElementsByTagName('channel').length; i++) {
            if (xmlDoc.getElementsByTagName('channel')[i].querySelector("*[href*='.jpeg'], *[href*='.jpg'], *[href*='.png']").length !== 0) {
                Artwork = xmlDoc.getElementsByTagName('channel')[i].querySelector("*[href*='.jpeg'], *[href*='.jpg'], *[href*='.png']").getAttribute('href')
            } else if (xmlDoc.getElementsByTagName('channel')[i].querySelector("*[url*='.jpeg'], *[url*='.jpg'], *[url*='.png']").length !== 0) {
                Artwork = xmlDoc.getElementsByTagName('channel')[i].querySelector("*[href*='.jpeg'], *[href*='.jpg'], *[href*='.png']").getAttribute('url')
            }
        }
    }

    // NOTE: set settings information

    document.getElementsByClassName('settings-image')[0].src = sanitizeString(Artwork)
    document.getElementsByClassName('settings-header')[0].innerHTML = sanitizeString(ChannelName)
    document.getElementsByClassName('settings-count')[0].innerHTML = xmlDoc.getElementsByTagName('item').length

    let List = document.getElementById('list')

    for (let i = 0; i < xmlDoc.getElementsByTagName('item').length; i++) {
        let Item = xmlDoc.getElementsByTagName('item')[i]

        // NOTE: Just enter if the current item contains an enclosure tag

        if (Item.getElementsByTagName("enclosure").length > 0) {
            var EpisodeTitle  = Item.getElementsByTagName("title")[0].childNodes[0].nodeValue
            var EpisodeLength = Item.getElementsByTagName("enclosure")[0].getAttribute("length")
            var EpisodeType   = Item.getElementsByTagName("enclosure")[0].getAttribute("type")
            var EpisodeUrl    = Item.getElementsByTagName("enclosure")[0].getAttribute("url")
            var EpisodeDescription = Item.getElementsByTagName('itunes:subtitle')[0] !== undefined ? Item.getElementsByTagName('itunes:subtitle')[0].textContent : Item.getElementsByTagName('description')[0].textContent
            var PubDate       = Item.getElementsByTagName("pubDate")[0].childNodes[0].nodeValue
            var DurationKey   = ((Item.getElementsByTagName("itunes:duration").length == 0) ? "duration" : "itunes:duration")

            var Duration = ""
            if (Item.getElementsByTagName(DurationKey).length > 0)
            {
                var Duration = parseFeedEpisodeDuration(Item.getElementsByTagName(DurationKey)[0].innerHTML.split(":"))

                if (Duration.hours == 0 && Duration.minutes == 0) { Duration = "" }
                else if (Duration != null)
                {
                    Duration = (Duration.hours != "0" ? Duration.hours + "h " : "") + Duration.minutes + "min"
                }
            }

            let ListElement = buildListItem(new cListElement(
                [
                    getBoldTextPart(EpisodeTitle),
                    getSubTextPart(new Date(PubDate).toLocaleString()),
                    getSubTextPart(Duration),
                    getFlagPart('Done', 'white', '#4CAF50'),
                    getDescriptionPart(s_InfoIcon, EpisodeDescription),
                    getIconButtonPart(s_AddEpisodeIcon)
                ],
                '3fr 1fr 1fr 5em 5em 5em'
            ), eLayout.row)

            if (isEpisodeAlreadySaved(EpisodeTitle)) {
                ListElement.replaceChild(getIconButtonPart(''), ListElement.children[5])
            }

            if (player.isPlaying(EpisodeUrl)) {
                ListElement.classList.add('select-episode')
            }

            // NOTE: Set a episode item to "Done" if it is in the History file

            if (getValueFromFile(getArchivedFilePath, 'episodeUrl', 'episodeUrl', EpisodeUrl) === null) {
                ListElement.replaceChild(getIconButtonPart(''), ListElement.children[3])
            }

            ListElement.setAttribute('onclick', 'playNow(this)')
            ListElement.setAttribute('channel', sanitizeString(ChannelName))
            ListElement.setAttribute('title', sanitizeString(EpisodeTitle))
            ListElement.setAttribute('type', EpisodeType)
            ListElement.setAttribute('url', sanitizeString(EpisodeUrl))
            ListElement.setAttribute('length', EpisodeLength)
            ListElement.setAttribute('duration', Duration)
            ListElement.setAttribute('description', sanitizeString(EpisodeDescription))
            ListElement.setAttribute('artworkUrl', Artwork)

            List.append(ListElement)
        }
    }
}

function addToEpisodes(_Self) {
    let ListElement = _Self.parentElement.parentElement

    saveEpisode(ListElement.getAttribute('channel'), ListElement.getAttribute('title'), ListElement.getAttribute('url'), ListElement.getAttribute('type'), ListElement.getAttribute('length'), ListElement.getAttribute('description'), ListElement.getAttribute('duration'))

    _Self.innerHTML = ''
}

function saveEpisode(_ChannelName, _EpisodeTitle, _EpisodeUrl, _EpisodeType, _EpisodeLength, _EpisodeDescription, _Duration) {
    let Feed = {
        'channelName': _ChannelName,
        'duration': _Duration,
        'episodeDescription': _EpisodeDescription,
        'episodeLength': _EpisodeLength,
        'episodeTitle': _EpisodeTitle,
        'episodeType': _EpisodeType,
        'episodeUrl': _EpisodeUrl,
        'playbackPosition': 0
    }

    let JsonContent = []

    if (fs.existsSync(getNewEpisodesSaveFilePath()) && fs.readFileSync(getNewEpisodesSaveFilePath(), 'utf-8') !== '') {
        JsonContent = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), 'utf-8'))
    } else {
        fs.writeFileSync(getNewEpisodesSaveFilePath(), JSON.stringify(JsonContent))
    }

    if (!isEpisodeAlreadySaved(_EpisodeTitle)) {
        JsonContent.push(Feed)
    }

    fs.writeFileSync(getNewEpisodesSaveFilePath(), JSON.stringify(JsonContent))

    setItemCounts()
}
