function search(_Self, _Event) {
    if (_Event.code == "Escape")
        clearTextField(_Self);
    else {
        if(!$('#search-nothing-to-show').get(0))
            clearBody();

        clearMenuSelection();
        setHeader(generateHtmlTitle("Search"), '');

        $('#res').attr('return-value', '');
        getPodcasts(_Self.value);
    }
}

function getPodcasts(_SearchTerm) {
    _SearchTerm = encodeURIComponent(_SearchTerm);
    if (isProxySet())
        makeRequest(getITunesProxyOptions(_SearchTerm), null, getResults, eRequest.http);
    else
        makeRequest(getITunesOptions(_SearchTerm), null, getResults, eRequest.https);
}

function getResults(_Data, _eRequest, _Options) {
    let FeedUrl = (_Options instanceof Object ? _Options.path: _Options);
    let query = decodeURI(FeedUrl).split('=')[1].split('&')[0];
    
    let obj = JSON.parse(_Data);

    if(obj.results.length == 0)
        setNothingToShowBody(s_SearchNothingFoundIcon, 'search-nothing-to-show');
    else if(query == $('#search-input').val()){
        clearBody();
        let $list = $('#list');
        setGridLayout($list.get(0), false);

        for (let i in obj.results) {
            let podcast = new Podcast (
                obj.results[i].artistName,
                obj.results[i].collectionName,
                obj.results[i].artworkUrl30,
                obj.results[i].artworkUrl60,
                obj.results[i].artworkUrl100,
                obj.results[i].feedUrl
            );

            var HeartButton = null;
            if (isAlreadyFavorite(podcast.feedUrl))
                HeartButton = getFullHeartButton(podcast);
            else
                HeartButton = getHeartButton(podcast);

            $list.append(buildListItem(new cListElement(
                [
                    getImagePart(podcast.artworkUrl60),
                    getBoldTextPart(podcast.collectionName),
                    getSubTextPart(podcast.artistName),
                    HeartButton
                ],
                "5em 1fr 1fr 5em"
            ), eLayout.row));
        }
    }
}

function getHeartButton(_PodcastInfos) {
    let artists = _PodcastInfos.artistName;//.replace(/([\'])/g, "\\'").replace(/([\"])/g, '&quot;')
    let collection = _PodcastInfos.collectionName;//.replace(/([\'])/g, "\\'").replace(/([\"])/g, '&quot;')

    let $heartButtonElement = $('<div></div>');

    $heartButtonElement.html(s_Heart);
    $heartButtonElement.addClass('list-item-icon')
    $heartButtonElement.find('svg').click(function () {
        setFavorite(this, artists, 
                          collection, 
                          _PodcastInfos.artworkUrl30, 
                          _PodcastInfos.artworkUrl60, 
                          _PodcastInfos.artworkUrl100, 
                          _PodcastInfos.feedUrl
        );
    })
    return $heartButtonElement.get(0);
}

function getFullHeartButton(_PodcastInfos) {
    let artists = _PodcastInfos.artistName;//.replace(/([\'])/g, "\\'").replace(/([\"])/g, '&quot;')
    let collection = _PodcastInfos.collectionName//.replace(/([\'])/g, "\\'").replace(/([\"])/g, '&quot;')

    let $heartButtonElement = $('<div></div>');

    $heartButtonElement.html(s_FullHeart);
    $heartButtonElement.addClass('list-item-icon')
    $heartButtonElement.find('svg').click(function () {
        unsetFavorite(this, artists, 
                          collection, 
                          _PodcastInfos.artworkUrl30, 
                          _PodcastInfos.artworkUrl60, 
                          _PodcastInfos.artworkUrl100, 
                          _PodcastInfos.feedUrl
        );
    })
    return $heartButtonElement.get(0);
}