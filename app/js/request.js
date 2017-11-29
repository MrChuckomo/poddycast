
function makeRequest(_Options, _FallbackOptions, _Callback)
{
    // NOTE: Give the result JSON string to the given _Callback methode
    // NOTE: The _Callback methode need one argument to catch the JSON result string

    var Req = https.request(_Options, function (_Res)
    {
        var Chunks = [];

        _Res.on("data", function (_Chunk) { Chunks.push(_Chunk); });
        _Res.on("end",  function ()       { _Callback(Buffer.concat(Chunks).toString()) });
    });

    Req.on('error', function(_Error)
    {
        console.log('Problem with request: ' + _Error.message);

        if (_FallbackOptions != null)
        {
            console.log('Use fallback options: ' + _FallbackOptions);

            makeRequest(_FallbackOptions, null, _Callback)
        }
    });

    Req.end();
}

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
