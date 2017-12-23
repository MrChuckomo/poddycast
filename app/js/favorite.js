
function setFavorite(_Self, _ArtistName, _CollectioName, _Artwork30, _Artwork60, _Artwork100, _FeedUrl)
{
    var Feed =
    {
        "artistName": _ArtistName,
        "collectionName": _CollectioName,
        "artworkUrl30": _Artwork30,
        "artworkUrl60": _Artwork60,
        "artworkUrl100": _Artwork100,
        "feedUrl": _FeedUrl
    }

    _Self.innerHTML = s_HeartFilled
    _Self.classList.add("set-favorite")

    var JsonContent = []

    if (fs.existsSync(getSaveFilePath()) && fs.readFileSync(getSaveFilePath(), "utf-8") != "")
    {
        JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))
    }
    else
    {
        fs.writeFileSync(getSaveFilePath(), JSON.stringify(JsonContent))
    }

    if (!isAlreadySaved(_FeedUrl))
    {
        JsonContent.push(Feed)
    }

    fs.writeFileSync(getSaveFilePath(), JSON.stringify(JsonContent))

    addToSettings(_CollectioName, _FeedUrl)

    setItemCounts()
}
