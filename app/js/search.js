'use strict'

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

    let AllImageTags = xmlDoc.getElementsByTagName('image')
    let Image = null

    if (AllImageTags.length > 0) {
        if(AllImageTags[0].nodeName == 'itunes:image') {
            Image = AllImageTags[0].getAttribute('href')
        } else if (AllImageTags[0].nodeName == 'image') {
            Image = AllImageTags[0].getElementsByTagName('url')[0].innerHTML
        }
    }

    let AllAuthorTags = xmlDoc.getElementsByTagName('author')
    let Author = null

    if (AllAuthorTags.length > 0) {
        Author = AllAuthorTags[0].innerHTML
    } else {
        Author = xmlDoc.getElementsByTagName('creator')[0].childNodes[0].data
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
