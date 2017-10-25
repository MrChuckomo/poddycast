var https = require('https');

var options =
{
    // host: 'www.google.com',
    host: 'itunes.apple.com',
    port: 443,
    // path: '/lookup?id=909253',
    path: '/search?term=jack+johnson',
    method: 'GET',
    // headers:
    // {
    //     'Content-Type': 'application/json'
    // }
};

var req = https.request(options, function(res)
{
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk)
    {
        console.log('BODY: ' + chunk);

        document.getElementById("rest-body").innerHTML = chunk
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
