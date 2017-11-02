const fs = require('fs')

// function setFavorite(_Self, _FeedUrl)
function setFavorite(_Self, _ArtistName, _CollectioName, _Artwork60, _FeedUrl)
{
    var Feed =
    {
        "artistName": _ArtistName,
        "collectionName": _CollectioName,
        "artworkUrl60": _Artwork60,
        "feedUrl": _FeedUrl
    }

    _Self.innerHTML =
    `
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    `

    _Self.classList.add("set-favorite")

    var JsonContent = []

    if (fs.existsSync(process.env['HOME'] + "/Desktop/data.json"))
    {
        JsonContent = JSON.parse(fs.readFileSync(process.env['HOME'] + "/Desktop/data.json", "utf-8"))
    }

    var FeedExists = false;

    for (var i = 0; i < JsonContent.length; i++)
    {
        if (JsonContent[i].feedUrl == _FeedUrl)
        {
            FeedExists = true
            break
        }
    }

    if (!FeedExists)
    {
        JsonContent.push(Feed)
    }

    fs.writeFileSync(process.env['HOME'] + "/Desktop/data.json", JSON.stringify(JsonContent))
}


function showFavorites()
{
    if (fs.existsSync(process.env['HOME'] + "/Desktop/data.json"))
    {
        JsonContent = JSON.parse(fs.readFileSync(process.env['HOME'] + "/Desktop/data.json", "utf-8"))

        clearContent()

        for (var i = 0; i < JsonContent.length; i++)
        {            
            List.append(getPodcastElement(JsonContent[i].artworkUrl60, JsonContent[i].artistName, JsonContent[i].collectionName))
        }
    }
}
