
var http  = require('http')
var https = require('https')
const axios = require('axios')
const xml = require('xml2json')

var eRequest =
{
    http: 1,
    https: 2,
}

function makeRequest(_Options, _FallbackOptions, _Callback, _eRequest)
{
    // NOTE: Give the result JSON string to the given _Callback methode
    // NOTE: The _Callback methode need one argument to catch the JSON result string

    var Req = undefined

    switch (_eRequest)
    {
        case eRequest.http:
            Req = http.request(_Options, function (_Res)
            {
                var Chunks = []

                _Res.on("data", function (_Chunk) { Chunks.push(_Chunk) })
                _Res.on("end",  function ()       { _Callback(Buffer.concat(Chunks).toString().trim(), _eRequest, _Options) })
            })
            break

        case eRequest.https:
        default:
            Req = https.request(_Options, function (_Res)
            {
                var Chunks = []

                _Res.on("data", function (_Chunk) { Chunks.push(_Chunk) })
                _Res.on("end",  function ()       { _Callback(Buffer.concat(Chunks).toString().trim(), _eRequest, _Options) })
            })
            break
    }

    // NOTE: In case of any error try the given fallback options (can be proxy settings)

    if (Req != undefined)
    {
        Req.on('error', function(_Error)
        {
            console.log('Problem with request: ' + _Error.message)

            if (_FallbackOptions != null)
            {
                console.log('Use fallback options: ' + _FallbackOptions)

                makeRequest(_FallbackOptions, null, _Callback, _eRequest)
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
            var result = parseXmlToJson(response.data)
            resolve(result)
        }).catch(function (error) {
            reject(error)
        })
    })
}
module.exports.makeFeedRssRequest = makeFeedRssRequest

function makeFeedRequest(_Feed, _Callback)
{
    if (_Feed instanceof Object)
    {
        makeRequest(_Feed, null, _Callback, eRequest.http)
    }
    else
    {
        if (_Feed.includes("https"))
        {
            makeRequest(_Feed, getFeedProxyOptions(_Feed), _Callback, eRequest.https)
        }
        else
        {
            makeRequest(_Feed, getFeedProxyOptions(_Feed), _Callback, eRequest.http)
        }
    }
}

// ---------------------------------------------------------------------------------------------------------------------

function getITunesOptions(_SearchTerm)
{
    var Options =
    {
        method: 'GET',
        host: 'itunes.apple.com',
        port: 443,
        path: '/search?term=' + _SearchTerm + '&media=podcast'
    }

    return Options
}

function getITunesProxyOptions(_SearchTerm)
{
    var Options =
    {
        method: 'GET',
        host: 'proxy',
        port: 8080,
        path: 'http://itunes.apple.com/search?term=' + _SearchTerm + '&media=podcast'
    }

    return Options
}

function getFeedProxyOptions(_Url)
{
    var Options =
    {
        method: 'GET',
        host: 'proxy',
        port: 8080,
        path: _Url
    }

    return Options
}

// Using rss-to-json source https://github.com/nasa8x/rss-to-json/blob/master/src/rss.js
function parseXmlToJson(_Xml) {
    var rss = { items: [] }
    var result = xml.toJson(_Xml, { object: true })

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
