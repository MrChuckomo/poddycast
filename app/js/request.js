'use strict'

var http  = require('http');
var https = require('https');

var eRequest = {
    http: 1,
    https: 2,
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
            _Res.on('end', function () {
                _Callback(Buffer.concat(Chunks).toString().trim(), _eRequest, _Options)
            });
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
        })
        break;
    }

    // NOTE: In case of any error try the given fallback options (can be proxy settings)

    if (Req !== undefined) {
        Req.on('error', function(_Error) {
            console.log('Problem with request: ' + _Error.message);

            if (_FallbackOptions !== null) {
                console.log('Use fallback options: ' + _FallbackOptions);

                makeRequest(_FallbackOptions, null, _Callback, _eRequest)
            }
        })

        Req.end()
    }
}

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
