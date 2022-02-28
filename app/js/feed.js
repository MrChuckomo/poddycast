'use strict'

var CContentHelper = require('./helper/content')
const { isProxySet } = require('./helper/helper_global')
var CPlayer = require('./helper/player')
const request = require('./request')

var helper = new CContentHelper()
var player = new CPlayer()

/**
 * Read all saved feeds and save latest episodes if applicable.
 * @public
 * @returns void
 */
function readFeeds() {
  // TODO: Save a file for each podcast including all episodes

  // Add animation to notify the user about fetching new episodes
  document.querySelector("#menu-refresh svg").classList.add("is-refreshing");

  if (fs.readFileSync(saveFilePath, "utf-8") != "") {
    var JsonContent = JSON.parse(fs.readFileSync(saveFilePath, "utf-8"));

    let feedUrl = "";
    for (let i = 0; i < JsonContent.length; i++) {
      // use proxy url if proxy is set
      feedUrl = isProxySet()
        ? getFeedProxyOptions(JsonContent[i].feedUrl)
        : JsonContent[i].feedUrl;

      request
        .requestPodcastFeed(feedUrl, false)
        .then((result) => {
          saveLatestEpisodeJson(result);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          // stop refreshing on success or failure
          // includes minimum delay for user feedback
          setTimeout(() => {
            document
              .querySelector("#menu-refresh svg")
              .classList.remove("is-refreshing");
          }, 1000)
        });
    }
  }
}
module.exports.readFeeds = readFeeds;

/**
 * Loads window to show all podcast episodes for a given feed.
 * @public
 * @param {DOM_element} element HTML DOM element being selected
 */
function showAllEpisodes(element) {
    setGridLayout(document.getElementById('list'), false)

    helper.clearContent()
    setHeaderViewAction()

    const feedUrl = element.getAttribute('feedurl')
    const podcastName = getValueFromFile(saveFilePath, "collectionName", "feedUrl", feedUrl)

    appendSettingsSection(podcastName, feedUrl)

    request
      .requestPodcastFeed(feedUrl, false)
      .then((result) => {
        displayEpisodesInList(result);
      })
      .catch((error) => {
        console.log(error);
      });
}
module.exports.showAllEpisodes = showAllEpisodes

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

    if (fs.existsSync(playlistFilePath) && fs.readFileSync(playlistFilePath, 'utf-8') !== '') {
        let JsonContent = JSON.parse(fs.readFileSync(playlistFilePath, 'utf-8'))

        for (let i = 0; i < JsonContent.length; i++) {
            let IsInPlaylist = isAlreadyInPlaylist(JsonContent[i].playlistName, _PodcastName)

            PlaylistMenu.append(new MenuItem({
                checked: IsInPlaylist,
                click(self) {
                    let JsonContent = JSON.parse(fs.readFileSync(playlistFilePath, 'utf-8'))

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

                    fs.writeFileSync(playlistFilePath, JSON.stringify(JsonContent))
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

/**
 * Displays all podcast episodes in list view.
 * @private
 * @param {JSON} podcastObject Podcast feed in JSON format.
 */
function displayEpisodesInList(podcastObject) {
    const channelName = podcastObject.title
    const artwork = getValueFromFile(saveFilePath, 'artworkUrl60', 'collectionName', channelName)
    document.getElementsByClassName('settings-image')[0].src = sanitizeString(artwork)
    document.getElementsByClassName('settings-header')[0].innerHTML = sanitizeString(channelName)
    document.getElementsByClassName('settings-count')[0].innerHTML = podcastObject.items.length

    let list = document.getElementById('list')

    podcastObject.items.forEach(episode => {
        let listElement = buildListItem(new cListElement(
            [
                getBoldTextPart(episode.title),
                getSubTextPart(new Date(episode.published).toLocaleString()),
                getSubTextPart(episode.duration_formatted),
                getFlagPart('Done', 'white', '#4CAF50'),
                getDescriptionPart(s_InfoIcon, episode.description),
                getIconButtonPart(s_AddEpisodeIcon)
            ],
            '3fr 1fr 1fr 5em 5em 5em'
        ), eLayout.row)

        if (isEpisodeAlreadySaved(episode.title)) {
            listElement.replaceChild(getIconButtonPart(''), listElement.children[5])
        }

        if (player.isPlaying(episode.url)) {
            listElement.classList.add('select-episode')
        }

        // NOTE: Set a episode item to "Done" if it is in the History file

        if (getValueFromFile(archivedFilePath, "episodeUrl", "episodeUrl", episode.url) == null)
        {
            listElement.replaceChild(getIconButtonPart(''), listElement.children[3])
        }

        listElement.setAttribute('onclick', 'playNow(this)')
        listElement.setAttribute('channel', sanitizeString(channelName))
        listElement.setAttribute('title', sanitizeString(episode.title))
        listElement.setAttribute('type', episode.type)
        listElement.setAttribute('url', sanitizeString(episode.url))
        listElement.setAttribute('length', episode.duration_formatted)
        listElement.setAttribute('duration', episode.duration)
        listElement.setAttribute('description', sanitizeString(episode.description))
        listElement.setAttribute('artworkUrl', artwork)

        list.append(listElement)
    })
}

/**
 * Add episode to user's episode list.
 * @public
 * @param {DOM_element} addEpisodeIconElement HTML DOM element used to add episode.
 */
function addToEpisodes(addEpisodeIconElement) {

    const episodeElement = addEpisodeIconElement.parentElement.parentElement

    const episodeObject = {
        'channelName': episodeElement.getAttribute('channel'),
        'episodeTitle': episodeElement.getAttribute('title'),
        'episodeDescription': episodeElement.getAttribute('description'),
        'episodeLength': episodeElement.getAttribute('length'),
        'episodeType': episodeElement.getAttribute('type'),
        'episodeUrl': episodeElement.getAttribute('url'),
        'duration': episodeElement.getAttribute('duration'),
        'playbackPosition': 0
    }

    saveEpisodeObject(episodeObject)

    addEpisodeIconElement.innerHTML = ''
}
module.exports.addToEpisodes = addToEpisodes

/**
 * Saves the latest episode of a podcast feed to the user's episode list.
 * @private
 * @param {JSON} content Podcast feed in JSON format
 */
function saveLatestEpisodeJson(content) {
    // NOTE: Fetch the new episode only if it is not disabled in the podcast settings
    if (!isAddedToInbox(content.link))
        return

    const episodeObject = {
        'channelName': content.title,
        'episodeTitle': content.items[0].title,
        'episodeDescription': content.items[0].description,
        'episodeLength': content.items[0].duration,
        'episodeType': content.items[0].type,
        'episodeUrl': content.items[0].link,
        'duration': content.items[0].duration_formatted,
        'playbackPosition': 0
    }
    
    // NOTE: save latest episode if not already in History
    if (getValueFromFile(archivedFilePath, "episodeUrl", "episodeUrl", episodeObject['episodeUrl']) == null)
    {
        saveEpisodeObject(episodeObject)
    }
}

/**
 * Saves a podcast episode to the new episodes save file.
 * @private
 * @param {JSON} episodeObject Podcast episode data in JSON format.
 */
function saveEpisodeObject(episodeObject) {
    let JsonContent = []

    if (fs.existsSync(newEpisodesSaveFilePath) && fs.readFileSync(newEpisodesSaveFilePath, "utf-8") != "") {
        JsonContent = JSON.parse(fs.readFileSync(newEpisodesSaveFilePath, "utf-8"))
    } else {
        fs.writeFileSync(newEpisodesSaveFilePath, JSON.stringify(JsonContent))
    }

    if (!isEpisodeAlreadySaved(episodeObject.episodeTitle)) {
        JsonContent.push(episodeObject)
    }

    fs.writeFileSync(newEpisodesSaveFilePath, JSON.stringify(JsonContent))

    setItemCounts()
}
