'use strict'

function setFavorite(_Self, _ArtistName, _CollectioName, _Artwork30, _Artwork60, _Artwork100, _FeedUrl) {
    let Feed = {
        'artistName': _ArtistName,
        'artworkUrl100': _Artwork100,
        'artworkUrl30': _Artwork30,
        'artworkUrl60': _Artwork60,
        'collectionName': _CollectioName,
        'feedUrl': _FeedUrl
    }

    _Self.innerHTML = s_HeartFilled
    _Self.classList.add('set-favorite')

    let JsonContent = []

    if (fs.existsSync(getSaveFilePath()) && fs.readFileSync(getSaveFilePath(), 'utf-8') !== '') {
        JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), 'utf-8'))
    } else {
        fs.writeFileSync(getSaveFilePath(), JSON.stringify(JsonContent))
    }

    if (!isAlreadySaved(_FeedUrl)) {
        JsonContent.push(Feed)
    }

    fs.writeFileSync(getSaveFilePath(), JSON.stringify(JsonContent))
    addToSettings(_CollectioName, _FeedUrl)
    setItemCounts()
}
