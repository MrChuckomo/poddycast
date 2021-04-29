'use strict'
const { systemPreferences } = require('electron')
var CContentHelper = require('./js/helper/content')

var CContentHelper = require('./js/helper/content')
var helper = new CContentHelper()


function search(_Self, _Event) {
    if (_Event.code == 'Enter') {
        helper.clearContent()
        setHeaderViewAction()
        clearMenuSelection()
        helper.setHeader(i18n.__('Search'))

        document.getElementById('res').setAttribute('return-value', '')

        if (_Self.value.includes('http') && _Self.value.includes(':') && _Self.value.includes('//')) {
            getPodcastsFromFeed(_Self.value)
        } else {
            getPodcasts(_Self.value)
        }
    } else if (_Event.code == 'Escape') {
        clearTextField(_Self)
    }
}

// ---------------------------------------------------------------------------------------------------------------------

function getPodcastsFromFeed(_SearchTerm) {
    // http://feeds.feedburner.com/ICO-Radio

    if (isProxySet()) {
        makeRequest(getFeedProxyOptions(_SearchTerm), null, getFeedResults, eRequest.http)
    } else {
        if (_SearchTerm.includes('https')) {
            makeRequest(_SearchTerm, null, getFeedResults, eRequest.https)
        } else {
            makeRequest(_SearchTerm, null, getFeedResults, eRequest.http)
        }
    }
}

function getFeedResults(_Data) {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(_Data, 'text/xml');

    var Image = xmlDoc.getElementsByTagName("itunes:image")[0].getAttribute("href")
    var Author = xmlDoc.getElementsByTagName("itunes:author")[0].innerHTML

    if (Image == null || Author == null)
    {
        console.log("ERROR: invalid itunes feed")
    }

    helper.clearContent()

    let List = document.getElementById('list')

    setGridLayout(List, false)

    let PodcastInfos = {
        'feedUrl': document.getElementById('search-input').value,
        'artistName': Author,
        'collectionName': xmlDoc.getElementsByTagName('channel')[0].getElementsByTagName('title')[0].innerHTML,
        'artworkUrl30': Image,
        'artworkUrl60': Image,
        'artworkUrl100': Image,
    }

    let Icon = getIcon(PodcastInfos)

    if (isAlreadySaved(PodcastInfos.feedUrl)) {
        Icon = getFullIcon(PodcastInfos)
    }

    List.append(getPodcastElement(null, PodcastInfos.artworkUrl60, PodcastInfos.artistName, PodcastInfos.collectionName, Icon))
}
