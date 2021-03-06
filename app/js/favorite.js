'use strict'

function setFavorite(_Self, _ArtistName, _CollectionName, _Artwork30, _Artwork60, _Artwork100, _FeedUrl) {
    let Feed = {
        'artistName': sanitizeString(_ArtistName),
        'collectionName': sanitizeString(_CollectionName),
        'artworkUrl30': sanitizeString(_Artwork30),
        'artworkUrl60': sanitizeString(_Artwork60),
        'artworkUrl100': sanitizeString(_Artwork100),
        'feedUrl': _FeedUrl,
        'addToInbox': true,
        'feedUrlStatus': 200 // Set default URL status to 200
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
    setItemCounts()
}
