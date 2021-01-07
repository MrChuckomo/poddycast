
var http  = require('http');
var https = require('https');

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
                var Chunks = [];

                _Res.on("data", function (_Chunk) { Chunks.push(_Chunk); });
                _Res.on("end",  function ()       { _Callback(Buffer.concat(Chunks).toString().trim(), _eRequest, _Options) });
            });

            updateFeedURLStatus(true, _Options);

            break;

        case eRequest.https:
        default:
            Req = https.request(_Options, function (_Res)
            {
                var Chunks = [];

                _Res.on("data", function (_Chunk) { Chunks.push(_Chunk); });
                _Res.on("end",  function ()       { _Callback(Buffer.concat(Chunks).toString().trim(), _eRequest, _Options) });
            });

            // updateFeedURLStatus(true, _Options);

            break;
    }

    // NOTE: In case of any error try the given fallback options (can be proxy settings)

    if (Req != undefined)
    {
        Req.on('error', function(_Error)
        {
            console.log('Problem with request: ' + _Error.message);

            updateFeedURLStatus(false, _Options);

            if (_FallbackOptions != null)
            {
                console.log('Use fallback options: ' + _FallbackOptions);

                makeRequest(_FallbackOptions, null, _Callback, _eRequest);

                updateFeedURLStatus(false, _Options);
            }
        });

        Req.end();
    }
}

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
    };

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
    };

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
    };

    return Options
}

// ---------------------------------------------------------------------------------------------------------------------

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
        if (fs.readFileSync(getSaveFilePath(), "utf-8") != "") {
            var JsonContentOld = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))
            var JsonContentNew = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))

            for (var i = 0; i < JsonContentNew.length; i++) {
                // Find feed item that's returning error
                if (feedURL === JsonContentNew[i].feedUrl.replace(/(http|https):\/\//, '').replace('.xml', '')) {
                    // Update feedUrlStatus prop
                    JsonContentNew[i].feedUrlStatus = !isURLWorking ? 500 : 200
                }
            }

            // Update JSON with feeds if there are changes
            if (JsonContentOld !== JsonContentNew) {
                fs.writeFileSync(getSaveFilePath(), JSON.stringify(JsonContentNew))
            }
        }
    }
}
