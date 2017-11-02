
// https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api/#overview
// https://itunes.apple.com/search?term=freakshow&media=podcast

var https = require('https');

function getPodcasts(_SearchTerm)
{
    _SearchTerm = _SearchTerm.replace(/ /g, "%20")

    var options =
    {
        host: 'itunes.apple.com',
        port: 443,
        path: '/search?term=' + _SearchTerm + '&media=podcast',
        // path: '/search?term=freakshow&media=podcast',
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

            // document.getElementById("res").innerHTML += chunk

            if (document.getElementById("res").getAttribute("return-value") == null)
            {
                document.getElementById("res").setAttribute("return-value", chunk)
            }
            else
            {
                Value = document.getElementById("res").getAttribute("return-value") + chunk
                document.getElementById("res").setAttribute("return-value", Value)
            }
        });

        res.on("end", function()
        {
            getResults()
        })
    });

    req.on('error', function(e)
    {
        console.log('problem with request: ' + e.message);
    });

    req.end();
}


// function getArtistName()
function getResults()
{
    // chunk = document.getElementById("res").innerHTML
    chunk = document.getElementById("res").getAttribute("return-value")

    var obj = JSON.parse(chunk);

    clearContent()

    List = document.getElementById("list")

    for (var i = 0; i < obj.results.length; i++)
    {        
        var PodcastInfos = {
            "feedUrl": obj.results[i].feedUrl,
            "artistName": obj.results[i].artistName,
            "collectionName": obj.results[i].collectionName,
            "artworkUrl60": obj.results[i].artworkUrl60,
        }

        List.append(getPodcastElement(obj.results[i].artworkUrl60, obj.results[i].artistName, obj.results[i].collectionName, getIcon(PodcastInfos)))
    }
}

function getCollectionName()
{
    chunk = document.getElementById("res").innerHTML

    var obj = JSON.parse(chunk);

    for (var i = 0; i < obj.results.length; i++)
    {
        console.log(obj.results[i].collectionName)
    }
}

function getArtWork()
{
    chunk = document.getElementById("res").innerHTML

    var obj = JSON.parse(chunk);

    for (var i = 0; i < obj.results.length; i++)
    {
        console.log(obj.results[i].artworkUrl30)
        console.log(obj.results[i].artworkUrl60)
        console.log(obj.results[i].artworkUrl100)
    }
}

// function clearContent()
// {
//     // document.getElementById("res").innerHTML = ""
//     document.getElementById("list").innerHTML = ""
// }

// function getIcon(_FeedUrl)
function getIcon(_PodcastInfos)
{
    // console.log(_FeedUrl);
    // console.log(_PodcastInfos);

    var Icon =
    `
        <svg onclick="setFavorite(this, '`+_PodcastInfos.artistName+`', '`+_PodcastInfos.collectionName+`', '`+_PodcastInfos.artworkUrl60+`', '`+_PodcastInfos.feedUrl+`')" fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0h24v24H0z" fill="none"/>
            <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
        </svg>
    `

    return Icon
}
