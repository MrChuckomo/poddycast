process.dlopen = () => {
  throw new Error('Load native module is not safe')
}
const xmlParserWorker = new Worker('./js/xmlparser_worker.js')
const updateFeedWorker = new Worker('./js/update_feed_worker.js')

setInterval(function () { 
    readFeeds();
    console.log('Feeds have been read!');
}, 30 * 60 * 1000);

function checkDateIsInTheLastWeek(episode) {
    var day = new Date();
    var previousweek = day.getTime() - 7 * 24 * 60 * 60 * 1000;

    return (compareEpisodeDates(episode, {pubDate: previousweek}) > 0);
}

function compareEpisodeDates(episode1, episode2) {
    
    let pubDate1 = (episode1.pubDate ? episode1.pubDate : getInfoEpisodeByObj(episode1).pubDate);
    let pubDate2 = (episode2.pubDate ? episode2.pubDate : getInfoEpisodeByObj(episode2).pubDate);
    let date1 = new Date(pubDate1);
    let date2 = new Date(pubDate2);
    if(date1.getTime() < date2.getTime())
        return -1;
    if(date1.getTime() > date2.getTime())
        return 1;
    return 0;
}


function getInfoEpisodeByObj(episode) {
    let feedUrl = episode.feedUrl;
    let episodeUrl = episode.episodeUrl;
    if(feedUrl && episodeUrl)
        return allFeeds.getEpisodeByEpisodeUrl(feedUrl, episodeUrl);
    return undefined;
}

function urlify(text) {
    let urlRegex = /(https?:\/\/)?[\w\-@~]+(\.[\w\-~]+)+(\/[\w\-~@:%]*)*(#[\w\-]*)?(\?[^\s]*)?/gi;
    return text.replace(urlRegex, function (url) {
        if(url.length <= 3)
            return url;
        let content = url;
        if(url.indexOf('@') != -1)
            url = 'mailto:' + url;
        else if(url.substr(0, 4) != 'http')
            url = 'http://' + url;
        return '<a href="' + url + '">' + content + '</a>';
    })
}

function getInfoFromDescription(episodeDescription) {
    return (episodeDescription.indexOf('</a>') == -1 ? urlify(episodeDescription) : episodeDescription);
}

function getDurationFromDurationKey(episode) {
    if(!episode.durationKey)
        return "#h #min";

    let duration = parseFeedEpisodeDuration(episode.durationKey.split(":"));

    if (duration.hours == 0 && duration.minutes == 0) 
        duration = "";
    else
        duration = duration.hours + "h " + duration.minutes + "min";
    return duration;
}

function readFeeds() {
    $('#menu-refresh svg').addClass('is-refreshing');
    $('#menu-refresh').off('click');

    if(!allFavoritePodcasts.isEmpty()) {
        let podcasts = allFavoritePodcasts.getAll();
        for (let i in podcasts) {
            allFeeds.lastFeedUrlToReload = podcasts[i].feedUrl;
            readFeedByFeedUrl(podcasts[i].feedUrl);
        }
    } else
        setTimeout(() => {
            $('#menu-refresh svg').removeClass('is-refreshing');
            $('#menu-refresh').click(readFeeds);
        }, 2000); 
}

function readFeedByFeedUrl(feedUrl) {
    if (isProxySet()) 
        makeFeedRequest(getFeedProxyOptions(feedUrl), updateFeed);
    else 
        makeFeedRequest(feedUrl, updateFeed);
}

function updateFeed(_Content, _eRequest, _Options) {
    let FeedUrl = (_Options instanceof Object ? _Options.path: _Options);
    allFeeds.initFeed(FeedUrl)

    if (isContent302NotFound(_Content))
        makeFeedRequest(getChangedFeed(_Options, _eRequest), updateFeed);
    else {
        if (_Content.includes("<html>")) {
            // Nothing
        } else  {
            xmlParserWorker.postMessage({
                xml: _Content,
                feedUrl: FeedUrl,
                artwork: getBestArtworkUrl(FeedUrl)
            })
        }
    }
}

xmlParserWorker.onmessage = function(ev) {
    let newFeed = ev.data.json;
    let podcastData = ev.data.podcastData; 
    let feedUrl = podcastData.feedUrl;
    let oldFeed =  allFeeds.getFeedPodcast(feedUrl);
    oldFeed = (!oldFeed ? [] : oldFeed);

    allFavoritePodcasts.setData(podcastData); 
    allFeeds.set(newFeed);
    
    if(allFeeds.ui.checkPageByFeedUrl(feedUrl)) {
        allFeeds.ui.setHeaderArtistContent(podcastData.data.artistName);
        allFeeds.ui.setHeaderDescriptionContent(getInfoFromDescription(podcastData ? podcastData.data.description : ''));
    }

    updateFeedWorker.postMessage({
        oldFeed: oldFeed,
        newFeed: newFeed
    })

    if(allFeeds.lastFeedUrlToReload == feedUrl)
        setTimeout(() => {
            $('#menu-refresh svg').removeClass('is-refreshing');
            $('#menu-refresh').click(readFeeds);
        }, 2000);  
}

updateFeedWorker.onmessage = function(ev) {
    let feedUrl = ev.data.feedUrl;
    let new_episodes = ev.data.new_episodes;
    let deleted_episodes = ev.data.deleted_episodes;
    let initialLength = ev.data.initialLength;
    let feed = ev.data.feed;
    
    if(initialLength == 0 && new_episodes.length == feed.length) {
        allFeeds.ui.showLastNFeedElements(feed);
        addEpisodesFromTheLastWeek(feedUrl, feed);
    } else {
        for(let i in new_episodes) {
            let index = allFeeds.findEpisodeByEpisodeUrl(feedUrl, new_episodes[i])
            let episode = feed[index];
            
            allFeeds.ui.add(episode, index);
            if(!getSettings(feedUrl) && checkDateIsInTheLastWeek(episode))
                allNewEpisodes.add(episode);
        }
    }

    for(let i = deleted_episodes.length - 1; i >= 0; i--) {
        let episodeUrl = deleted_episodes[i];

        allFeeds.ui.remove(feedUrl, episodeUrl);
        allFeeds.playback.remove(episodeUrl)
        allNewEpisodes.removeByEpisodeUrl(episodeUrl);
        allArchiveEpisodes.removeByEpisodeUrl(episodeUrl);
    } 
}

function addEpisodesFromTheLastWeek(feedUrl, feed) {
    if(!getSettings(feedUrl)) {
        for(let i in feed) {
            let episode = feed[i];
            if(checkDateIsInTheLastWeek(episode)) 
                allNewEpisodes.add(episode);
            else 
                return;
            
        }
    }
}

function showAllEpisodes(obj) {
    let podcast = _(obj);

    let tmpPodcast = allFavoritePodcasts.getByFeedUrl(podcast.feedUrl);
    if(tmpPodcast)
        podcast = tmpPodcast;
    if(!podcast.data)
        podcast = getPodcastFromEpisode(podcast);

    setGridLayout(false);

    clearBody();
    setHeaderViewAction();
    removeContentRightHeader();
    
    getAllEpisodesFromFeed(podcast);
}

function getAllEpisodesFromFeed(podcast) {
    let _Feed = podcast.feedUrl;

    allFeeds.ui.showHeader(podcast);

    let feed = allFeeds.getFeedPodcast(_Feed);
    allFeeds.ui.showLastNFeedElements(feed);

    if (isProxySet()) {
        if (_Feed instanceof Object)
            makeFeedRequest(_Feed, checkContent);
        else
            makeFeedRequest(getFeedProxyOptions(_Feed), checkContent);
    } else {
        makeFeedRequest(_Feed, checkContent);
    }
}

function checkContent(_Content, _eRequest, _Options) {
    if (isContent302NotFound(_Content)) {
        clearBody();
        getAllEpisodesFromFeed(getChangedFeed(_Options, _eRequest));
    } else {
        processEpisodes(_Content, _Options);
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// NOTE: Helper to clear corrupt feeds

function isContent302NotFound(_Content) {
    return (_Content == "" || _Content.includes("302 Found"));
}

function getChangedFeed(_Feed, _eRequest) {
    if (_Feed instanceof Object) {
        let Path = _Feed.path.toString()

        if      (Path.includes("http" )) { _Feed.path = Path.replace("http", "https") }
        else if (Path.includes("https")) { _Feed.path = Path.replace("https", "http") }
    } else {
        switch (_eRequest) {
            case eRequest.https: _Feed = _Feed.replace("https", "http"); break;
            case eRequest.http:  _Feed = _Feed.replace("http", "https"); break;
            default: break;
        }
    }

    return _Feed;
}

// ---------------------------------------------------------------------------------------------------------------------

function processEpisodes(_Content, _Options) {
    let feedUrl = (_Options instanceof Object ? _Options.path: _Options);
    xmlParserWorker.postMessage({
        xml: _Content,
        feedUrl: feedUrl,
        artwork: getBestArtworkUrl(feedUrl)
    });
}

function addToArchive(_Self) {
    let ListElement = _Self.parentElement.parentElement;

    allArchiveEpisodes.add(_(ListElement));

}

function removeFromArchive(_Self) {
    let ListElement = _Self.parentElement.parentElement;

    allArchiveEpisodes.removeByEpisodeUrl(_(ListElement).episodeUrl);
}