'use strict'

const http  = require('http')
const https = require('https')
const axios = require('axios')
const { XMLParser } = require('fast-xml-parser')

const eRequest = {
    http: 1,
    https: 2
}

function makeRequest(_Options, _FallbackOptions, _Callback, _eRequest) {
    // NOTE: Give the result JSON string to the given _Callback methode
    // NOTE: The _Callback methode need one argument to catch the JSON result string

    let Req = undefined

    switch (_eRequest) {
    case eRequest.http:
        Req = http.request(_Options, function (_Res) {
            let Chunks = [];

            _Res.on('data', function (_Chunk) {
                Chunks.push(_Chunk);
            });

            updateFeedURLStatus(true, _Options);
        })
        break;

    case eRequest.https:
    default:
        Req = https.request(_Options, function (_Res) {
            let Chunks = [];

            _Res.on('data', function (_Chunk) {
                Chunks.push(_Chunk);
            });
            _Res.on('end', function () {
                _Callback(Buffer.concat(Chunks).toString().trim(), _eRequest, _Options)
            });

            // updateFeedURLStatus(true, _Options);

        })
        break;
    }

    // NOTE: In case of any error try the given fallback options (can be proxy settings)

    if (Req !== undefined) {
        Req.on('error', function(_Error) {
            console.log('Problem with request: ' + _Error.message);

            updateFeedURLStatus(false, _Options);

            if (_FallbackOptions != null) {
                console.log('Use fallback options: ' + _FallbackOptions);

                makeRequest(_FallbackOptions, null, _Callback, _eRequest);

                updateFeedURLStatus(false, _Options);
            }
        })

        Req.end()
    }
}

function makeFeedRssRequest(_FeedUrl)
{
    return new Promise((resolve, reject) => {
        axios.get(_FeedUrl, {
            method: 'get',
            port: 443
        }).then(function (response) {
            resolve(parseXmlToJson(response.data))
        }).catch(function (error) {
            reject(error)
        })
    })
}
module.exports.makeFeedRssRequest = makeFeedRssRequest


function makeFeedRequest(_Feed, _Callback) {
    if (_Feed instanceof Object) {
        makeRequest(_Feed, null, _Callback, eRequest.http)
    } else {
        if (_Feed.includes('https')) {
            makeRequest(_Feed, getFeedProxyOptions(_Feed), _Callback, eRequest.https)
        } else {
            makeRequest(_Feed, getFeedProxyOptions(_Feed), _Callback, eRequest.http)
        }
    }
}

// ---------------------------------------------------------------------------------------------------------------------

function getITunesOptions(_SearchTerm) {
    let Options = {
        host: 'itunes.apple.com',
        method: 'GET',
        path: '/search?term=' + _SearchTerm + '&media=podcast',
        port: 443
    }

    return Options
}

function getITunesProxyOptions(_SearchTerm) {
    let Options = {
        host: 'proxy',
        method: 'GET',
        path: 'http://itunes.apple.com/search?term=' + _SearchTerm + '&media=podcast',
        port: 8080
    }

    return Options
}

function getFeedProxyOptions(_Url) {
    let Options = {
        host: 'proxy',
        method: 'GET',
        path: _Url,
        port: 8080
    }

    return Options
}

// ---------------------------------------------------------------------------------------------------------------------

async function parseXmlToJson(_Xml) {
    var rss = { items: [] }
    const parser = new XMLParser()
    var result = parser.parse(_Xml)
    var channel = result.rss && result.rss.channel ? result.rss.channel : result.feed
    if (Array.isArray(channel)) channel = channel[0]

    var items = channel.item || channel.entry

    if (channel.title) {
      rss.title = channel.title
    }

    if (channel.description) {
      rss.description = channel.description
    }

    rss.link = channel.link && channel.link.href ? channel.link.href : channel.link
    rss.category = channel.category || []

    if (channel.image) {
      rss.image = channel.image.url
    }

    if (!rss.image && channel["itunes:image"]) {
      rss.image = channel['itunes:image'].href
    }

    if (items && !Array.isArray(items)) {
      // the main 'items' code block below expects the items variable to be an Array of Objects
      // but if in the originating XML the channel element contains only a single item, the items
      // variable is set to a literal Object instead of an Array of Objects of length 1. It is fixed
      // here so the items variable behaves the same whether it contains 1 or many items
      items = [items]
    }

    if (items && items.length > 0) {

      for (let i = 0; i < items.length; i++) {
        var val = items[i]

        var obj = {}
        obj.title = val.title && val.title.$t ? val.title.$t : val.title
        obj.id = val.guid && val.guid.$t ? val.guid.$t : val.id
        obj.description = val.summary && val.summary.$t ? val.summary.$t : val.description
        obj.url = val.link && val.link.href ? val.link.href : val.link
        obj.link = obj.url
        obj.author = val.author && val.author.name ? val.author.name : val['dc:creator']
        obj.published = val.created ? Date.parse(val.created) : val.pubDate ? Date.parse(val.pubDate) : Date.now()
        obj.created = val.updated ? Date.parse(val.updated) : val.pubDate ? Date.parse(val.pubDate) : val.created ? Date.parse(val.created) : Date.now
        obj.category = val.category || []
        obj.content = val.content && val.content.$t ? val.content.$t : null

        // Medium Support via @sstrubberg
        if (val["content:encoded"]) {
          obj.content_encoded = val["content:encoded"]
          obj.content = obj.content_encoded
        }        
        // Captivate Support via @cvburgess
        if (val["podcast:transcript"]) {
          obj.podcast_transcript = val["podcast:transcript"].url
        }
        if (val['itunes:subtitle']) {
          obj.itunes_subtitle = val['itunes:subtitle']
        }
        if (val['itunes:summary']) {
          obj.itunes_summary = val['itunes:summary']
        }
        if (val['itunes:author']) {
          obj.itunes_author = val['itunes:author']
        }
        if (val['itunes:explicit']) {
          obj.itunes_explicit = val['itunes:explicit']
        }
        if (val['itunes:duration']) {
          obj.itunes_duration = val['itunes:duration']
        }
        if (val['itunes:season']) {
          obj.itunes_season = val['itunes:season']
        }
        if (val['itunes:episode']) {
          obj.itunes_episode = val['itunes:episode']
        }
        if (val['itunes:episodeType']) {
          obj.itunes_episode_type = val['itunes:episodeType']
        }
        if (val['itunes:image']) {
          obj.itunes_image = val['itunes:image'].href
        }

        obj.enclosures = val.enclosure ? Array.isArray(val.enclosure) ? val.enclosure : [val.enclosure] : []

        if (val['media:thumbnail']) {
          obj.media = val.media || {}
          obj.media.thumbnail = val['media:thumbnail']
          obj.enclosures.push(val['media:thumbnail'])
        }

        if (val['media:content']) {
          obj.media = val.media || {}
          obj.media.content = val['media:content']

          obj.enclosures.push(val['media:content'])
        }

        if (val['media:group']) {
          if (val['media:group']['media:title'])
            obj.title = val['media:group']['media:title']

          if (val['media:group']['media:description'])
            obj.description = val['media:group']['media:description']

          if (val['media:group']['media:thumbnail'])
            obj.enclosures.push(val['media:group']['media:thumbnail'].url)
        }

        rss.items.push(obj)
      }
    }
    
    return rss
}

function updateFeedURLStatus(isURLWorking, _Options) {
    if (_Options) {
        var feedURL = null

        if (typeof _Options === 'object' && _Options.path) {
            feedURL = _Options.path
        } else {
            feedURL = _Options
        }

        feedURL = feedURL.replace(/(http|https):\/\//, '').replace('.xml', '')

        // Check if JSON with feeds exists
        if (fs.readFileSync(saveFilePath, "utf-8") != "") {
            var JsonContentOld = JSON.parse(fs.readFileSync(saveFilePath, "utf-8"))
            var JsonContentNew = JSON.parse(fs.readFileSync(saveFilePath, "utf-8"))

            for (var i = 0; i < JsonContentNew.length; i++) {
                // Find feed item that's returning error
                if (feedURL === JsonContentNew[i].feedUrl.replace(/(http|https):\/\//, '').replace('.xml', '')) {
                    // Update feedUrlStatus prop
                    JsonContentNew[i].feedUrlStatus = !isURLWorking ? 500 : 200
                }
            }

            // Update JSON with feeds if there are changes
            if (JsonContentOld !== JsonContentNew) {
                fs.writeFileSync(saveFilePath, JSON.stringify(JsonContentNew))
            }
        }
    }
}
