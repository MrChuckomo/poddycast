
// https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api/#overview
// https://itunes.apple.com/search?term=freakshow&media=podcast

var https = require('https');

function getPodcasts()
{
    var options =
    {
        host: 'itunes.apple.com',
        port: 443,
        path: '/search?term=freakshow&media=podcast',
        method: 'GET',
    };

    var req = https.request(options, function(res)
    {
        // console.log('STATUS: ' + res.statusCode);
        // console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk)
        {
            // console.log('BODY: ' + chunk);

            document.getElementById("content-body").innerHTML += chunk
        });
    });

    req.on('error', function(e)
    {
        console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write('data\n');
    req.write('data\n');
    req.end();
}
