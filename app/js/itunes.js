
// https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api/#overview
// https://itunes.apple.com/search?term=freakshow&media=podcast


function getPodcasts(_SearchTerm)
{
    _SearchTerm = _SearchTerm.replace(/ /g, "+")
    _SearchTerm = _SearchTerm.replace(/ä/g, "a")
    _SearchTerm = _SearchTerm.replace(/ö/g, "o")
    _SearchTerm = _SearchTerm.replace(/ü/g, "u")
    _SearchTerm = _SearchTerm.replace(/Ä/g, "A")
    _SearchTerm = _SearchTerm.replace(/Ö/g, "O")
    _SearchTerm = _SearchTerm.replace(/Ü/g, "U")

    makeRequest(getITunesOptions(_SearchTerm), getITunesProxyOptions(_SearchTerm), getResults)
}

function getResults(_Data)
{
    var obj = JSON.parse(_Data);

    clearContent()

    var List = document.getElementById("list")

    for (var i = 0; i < obj.results.length; i++)
    {
        var PodcastInfos = {
            "feedUrl": obj.results[i].feedUrl,
            "artistName": obj.results[i].artistName,
            "collectionName": obj.results[i].collectionName,
            "artworkUrl30": obj.results[i].artworkUrl30,
            "artworkUrl60": obj.results[i].artworkUrl60,
            "artworkUrl100": obj.results[i].artworkUrl100,
        }

        var Icon = getIcon(PodcastInfos)

        if (isAlreadySaved(PodcastInfos.feedUrl))
        {
            Icon = getFullIcon(PodcastInfos)
        }

        List.append(getPodcastElement(null, obj.results[i].artworkUrl60, obj.results[i].artistName, obj.results[i].collectionName, Icon))
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

// ---------------------------------------------------------------------------------------------------------------------
// IMAGE ICONS
// ---------------------------------------------------------------------------------------------------------------------

function getIcon(_PodcastInfos)
{
    var Icon =
    `
        <svg onclick="setFavorite(this, '`+_PodcastInfos.artistName+`', '`+_PodcastInfos.collectionName+`', '`+_PodcastInfos.artworkUrl30+`', '`+_PodcastInfos.artworkUrl60+`', '`+_PodcastInfos.artworkUrl100+`', '`+_PodcastInfos.feedUrl+`')" fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0h24v24H0z" fill="none"/>
            <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
        </svg>
    `

    return Icon
}

function getFullIcon(_PodcastInfos)
{
    var Icon =
    `
        <svg class="set-favorite" fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0h24v24H0z" fill="none"/>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
    `

    return Icon
}
