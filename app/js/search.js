var searchTimeoutVar = null;

function search(_Self, _Event) {
    if (_Event.code == "Escape")
        clearTextField(_Self);
    else {
        if(!$('#search-nothing-to-show').get(0))
            clearBody();

        setContentRightHeader();
        clearMenuSelection();
        setHeader(generateHtmlTitle("Search"), '');

        $('#res').attr('return-value', '');
        
        getPodcasts(_Self.value);
    }
}

function getPodcasts(_SearchTerm) {
    if(searchTimeoutVar)
        clearTimeout(searchTimeoutVar);

    if(!_SearchTerm) {
        showSearchNothingToShow();
        return;
    }

    searchTimeoutVar = setTimeout(() => {
        _SearchTerm = encodeURIComponent(_SearchTerm);
        if (isProxySet())
            makeRequest(getITunesProxyOptions(_SearchTerm), null, getResults, eRequest.http);
        else
            makeRequest(getITunesOptions(_SearchTerm), null, getResults, eRequest.https);
    }, 300);
}

function getResults(_Data, _eRequest, _Options) {
    let FeedUrl = (_Options instanceof Object ? _Options.path: _Options);
    let query = decodeURI(FeedUrl).split('=')[1].split('&')[0];
    
    let obj = JSON.parse(_Data);

    if(obj.results.length == 0)
        showSearchNothingToShow();
    else if(query == $('#search-input').val()) {
        $('#content-right-header span').data(obj);
        showSearchList(obj.results);
    }
}

function showSearchList(results) {
    setContentRightHeader();
    clearBody();
    setGridLayout(false);

    let $list = $('#list');
    for (let i in results) {
        let Artwork = results[i].artworkUrl100;
        if(Artwork == undefined || Artwork == 'undefined') {
            Artwork = results[i].artworkUrl60;
            if(Artwork == undefined || Artwork == 'undefined') 
                Artwork = getGenericArtwork();
        }
        let podcast = new Podcast (
            results[i].artistName,
            results[i].collectionName,
            Artwork,
            results[i].feedUrl
        );

        var HeartButton = null;
        if (isAlreadyFavorite(podcast.feedUrl))
            HeartButton = getFullHeartButton(podcast);
        else
            HeartButton = getHeartButton(podcast);

        let item = buildListItem(new cListElement(
            [
                getImagePart(results[i].artworkUrl60),
                getBoldTextPart(podcast.data.collectionName),
                getSubTextPart(podcast.data.artistName),
                HeartButton
            ],
            "5em 1fr 1fr 5em"
        ), eLayout.row);

        $(item).data(podcast);
        item.onclick = function (e) {
            if($(e.target).is('svg') || $(e.target).is('path') || $(e.target).hasClass('list-item-icon')) {
                e.preventDefault();
                return;
            }
            showAllEpisodes(this);
        }
        $list.append(item);
        
    }
}

function showSearchNothingToShow() {
    setNothingToShowBody(s_SearchNothingFoundIcon, 'search-nothing-to-show');
}

function getHeartButton(_PodcastInfos) { 
    let $heartButtonElement = $('<div></div>');

    $heartButtonElement.html(s_Heart);
    $heartButtonElement.addClass('list-item-icon')
    $heartButtonElement.find('svg').click(function () {
        setFavorite(this, _PodcastInfos.data.artistName, 
                          _PodcastInfos.data.collectionName, 
                          _PodcastInfos.data.artworkUrl, 
                          _PodcastInfos.feedUrl,
                          _PodcastInfos.data.description
        );
    })
    return $heartButtonElement.get(0);
}

function getFullHeartButton(_PodcastInfos) {
    let $heartButtonElement = $('<div></div>');

    $heartButtonElement.html(s_FullHeart);
    $heartButtonElement.addClass('list-item-icon')
    $heartButtonElement.find('svg').click(function () {
        unsetFavorite(this, _PodcastInfos.data.artistName, 
                          _PodcastInfos.data.collectionName, 
                          _PodcastInfos.data.artworkUrl, 
                          _PodcastInfos.feedUrl,
                          _PodcastInfos.data.description
        );
    })
    return $heartButtonElement.get(0);
}
