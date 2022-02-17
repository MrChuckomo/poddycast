'use strict'

var CContentHelper = require('./js/helper/content')
var CPlayer = require('./js/helper/player')

var helper = new CContentHelper()
var player = new CPlayer()


function selectMenuItem(_MenuId) {
    let MenuItem = document.getElementById(_MenuId)

    clearTextField(document.getElementById('search-input'))
    clearTextField(document.getElementById('new_list-input'))

    loseFocusTextField('search-input')
    loseFocusTextField('new_list-input')

    clearPlaylists()
    clearMenuSelection()

    MenuItem.classList.add('selected')

    helper.setHeader(MenuItem.getElementsByTagName('span')[0].innerHTML)
}

function showNewEpisodes() {
    helper.clearContent()
    setHeaderViewAction()

    if (fs.existsSync(newEpisodesSaveFilePath) && fs.readFileSync(newEpisodesSaveFilePath, 'utf-8') !== '') {
        let JsonContent = JSON.parse(fs.readFileSync(newEpisodesSaveFilePath, 'utf-8'))
        let List = document.getElementById('list')

        setGridLayout(List, false)

        for (let i = 0; i < JsonContent.length; i++) {
            let Artwork = getValueFromFile(saveFilePath, 'artworkUrl60', 'collectionName', JsonContent[i].channelName)

            if (getValueFromFile(saveFilePath, 'artworkUrl100', 'collectionName', JsonContent[i].channelName) !== undefined && getValueFromFile(saveFilePath, 'artworkUrl100', 'collectionName', JsonContent[i].channelName) !== 'undefined') {
                Artwork = getValueFromFile(saveFilePath, 'artworkUrl100', 'collectionName', JsonContent[i].channelName)
            }

            if (/*Artwork !== null*/ true) { // Allow to show episodes without thumbnail
                let ListElement = buildListItem(new cListElement (
                    [
                        getImagePart(Artwork),
                        getBoldTextPart(JsonContent[i].episodeTitle),
                        getSubTextPart((JsonContent[i].duration === undefined) ? '' : JsonContent[i].duration),
                        getTextPart(JsonContent[i].channelName),
                        getDescriptionPart(s_InfoIcon, JsonContent[i].episodeDescription),
                        getIconButtonPart(s_DeleteIcon)
                    ],
                    '5em 1fr 6em 1fr 5em 5em'
                ), eLayout.row)

                ListElement.setAttribute('onclick', 'playNow(this)')
                ListElement.setAttribute('channel', JsonContent[i].channelName)
                ListElement.setAttribute('title', JsonContent[i].episodeTitle)
                ListElement.setAttribute('type', JsonContent[i].episodeType)
                ListElement.setAttribute('url', JsonContent[i].episodeUrl)
                ListElement.setAttribute('length', JsonContent[i].episodeLength)
                ListElement.setAttribute('artworkUrl', Artwork)


                if (player.isPlaying(JsonContent[i].episodeUrl)) {
                    ListElement.classList.add('select-episode')
                }

                let HeaderElement = ListElement.getElementsByClassName('podcast-entry-header')[0]

                List.append(ListElement)
            }
        }
    }
}

function showFavorites() {
    helper.clearContent()
    setHeaderViewAction('list')

    if (fs.existsSync(saveFilePath) && fs.readFileSync(saveFilePath, 'utf-8') !== '') {
        let JsonContent = JSON.parse(fs.readFileSync(saveFilePath, 'utf-8'))

        JsonContent = sortByName(JsonContent)

        let List = document.getElementById('list')

        setGridLayout(List, true)

        for (let i = 0; i < JsonContent.length; i++) {
            let Artwork = JsonContent[i].artworkUrl60

            if (JsonContent[i].artworkUrl100 !== undefined && JsonContent[i].artworkUrl100 !== 'undefined') {
                Artwork = JsonContent[i].artworkUrl100
            }

            let ListElement = getPodcastElement('podcast-entry', Artwork, null, JsonContent[i].collectionName, s_Favorite)

            ListElement.setAttribute('draggable', true)
            ListElement.addEventListener('dragstart', handleDragStart, false);

            let HeaderElement = ListElement.getElementsByClassName('podcast-entry-header')[0]

            HeaderElement.getElementsByTagName('img')[0].setAttribute('draggable', false)
            HeaderElement.setAttribute('feedUrl', JsonContent[i].feedUrl)
            HeaderElement.setAttribute('onclick', 'feed.showAllEpisodes(this)')

            // Display feedUrlStatus indicator
            if (JsonContent[i].feedUrlStatus) {
                if (JsonContent[i].feedUrlStatus === 500) {
                    var brokenLinkIcon = document.createElement("span")
                    brokenLinkIcon.innerHTML = s_BrokenLinkIcon
                    brokenLinkIcon.classList.add('icon-link-broken-wrapper')
                    brokenLinkIcon.setAttribute('title', 'Podcast feed URL is broken.')

                    HeaderElement.append(brokenLinkIcon)

                    // Display broken URL icon
                    if (HeaderElement.classList && !HeaderElement.classList.contains('podcast-feed-url-broken')) {
                        HeaderElement.classList.add('podcast-feed-url-broken')
                    }

                    if (HeaderElement.classList && HeaderElement.classList.contains('podcast-feed-url-working')) {
                        HeaderElement.classList.remove('podcast-feed-url-working')
                    }
                } else {
                    // Display checked/working icon
                    if (HeaderElement.classList && !HeaderElement.classList.contains('podcast-feed-url-working')) {
                        HeaderElement.classList.add('podcast-feed-url-working')
                    }

                    if (HeaderElement.classList && HeaderElement.classList.contains('podcast-feed-url-broken')) {
                        HeaderElement.classList.remove('podcast-feed-url-broken')
                    }
                }
            }

            List.append(ListElement)
        }
    }
}

function showHistory() {
    helper.clearContent()
    setHeaderViewAction()

    if (fs.existsSync(archivedFilePath) && fs.readFileSync(archivedFilePath, 'utf-8') !== '') {
        let JsonContent = JSON.parse(fs.readFileSync(archivedFilePath, 'utf-8'))
        let List = document.getElementById('list')

        setGridLayout(List, false)

        // NOTE: Show just the last 100 entries in History
        // TODO: The can be loaded after user interaction

        let Count = ((JsonContent.length <= 100) ? JsonContent.length : 100)

        for (let i = JsonContent.length - Count; i < JsonContent.length; i++) {
            let ChannelName = JsonContent[i].channelName
            let EpisodeTitle = JsonContent[i].episodeTitle
            let Artwork = getValueFromFile(saveFilePath, 'artworkUrl60', 'collectionName', ChannelName)

            if (getValueFromFile(saveFilePath, 'artworkUrl100', 'collectionName', ChannelName) !== undefined && getValueFromFile(saveFilePath, 'artworkUrl100', 'collectionName', ChannelName) !== 'undefined') {
                Artwork = getValueFromFile(saveFilePath, 'artworkUrl100', 'collectionName', ChannelName)
            }

            if (Artwork !== null) {
                let DateTime = new Date(JsonContent[i].date)
                let ListElement = buildListItem(new cListElement (
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

function showStatistics() {
    helper.clearContent()
    setHeaderViewAction()

    let JsonContent = null
    let List = document.getElementById('list')

    setGridLayout(List, false)

    List.append(getStatisticsElement('statistics-header', 'Podcasts', null))

    if (fileExistsAndIsNotEmpty(saveFilePath)) {
        JsonContent = JSON.parse(fs.readFileSync(saveFilePath, 'utf-8'))

        List.append(getStatisticsElement('statistics-entry', i18n.__('Favorite Podcasts'), JsonContent.length))
    } else {
        List.append(getStatisticsElement('statistics-entry', i18n.__('Favorite Podcasts'), 0))
    }

    if (fileExistsAndIsNotEmpty(archivedFilePath)) {
        JsonContent = JSON.parse(fs.readFileSync(archivedFilePath, "utf-8"))

        List.append(getStatisticsElement('statistics-entry', i18n.__('Last Podcast'), JsonContent[JsonContent.length - 1].channelName))
    } else {
        List.append(getStatisticsElement('statistics-entry', i18n.__('Last Podcast'), 'None'))
    }

    List.append(getStatisticsElement('statistics-header', i18n.__('Episodes'), null))

    if (fileExistsAndIsNotEmpty(archivedFilePath)) {
        List.append(getStatisticsElement("statistics-entry", i18n.__("History Items"),  JsonContent.length))
    } else {
        List.append(getStatisticsElement("statistics-entry", i18n.__("History Items"),  0))
    }

    if (fileExistsAndIsNotEmpty(newEpisodesSaveFilePath)) {
        JsonContent = JSON.parse(fs.readFileSync(newEpisodesSaveFilePath, "utf-8"))

        List.append(getStatisticsElement('statistics-entry', i18n.__('New Episodes'), JsonContent.length))
    } else {
        List.append(getStatisticsElement('statistics-entry', i18n.__('New Episodes'), 0))
    }

    List.append(getStatisticsElement('statistics-header', i18n.__('Playlists'), null))

    if (fileExistsAndIsNotEmpty(playlistFilePath)) {
        JsonContent = JSON.parse(fs.readFileSync(playlistFilePath, "utf-8"))

        List.append(getStatisticsElement('statistics-entry', i18n.__('Playlists'), JsonContent.length))
    } else {
        List.append(getStatisticsElement('statistics-entry', i18n.__('Playlists'), 0))
    }
}
