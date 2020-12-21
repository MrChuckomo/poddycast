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

    //return (compareEpisodeDates(dateStr, previousweek) > 0);
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

/*
function urlify(inputText) {
    var replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

    return replacedText;
}
*/

/*
function urlify(text) {
    let urlRegex = /(https?:\/\/)?[\w\-~]+(\.[\w\-~]+)+(\/[\w\-~@:%]*)*(#[\w\-]*)?(\?[^\s]*)?/gi;
    return text.replace(urlRegex, function (url) {
        return '<a href="' + (url.indexOf('http') == -1 ? 'http://' + url : url) + '">' + url + '</a>';
    })
}
*/

function urlify(text) {
    //let urlRegex = /(https?:\/\/)?[\w\-~]+(\.[\w\-~]+)+(\/[\w\-~@:%]*)*(#[\w\-]*)?(\?[^\s]*)?/gi;
    //let urlRegex = /[a-z0-9-\.@:/]+(https?:\/\/)?[\w\-~]+(\.[\w\-~]+)+(\/[\w\-~@:%]*)*(#[\w\-]*)?(\?[^\s]*)?/gi;
    let urlRegex = /(https?:\/\/)?[\w\-@~]+(\.[\w\-~]+)+(\/[\w\-~@:%]*)*(#[\w\-]*)?(\?[^\s]*)?/gi;
    //let urlRegex = /[a-z0-9-\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?$/;
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
/*
    let $div = $('<div></div>');
    $div.html(episodeDescription.indexOf('</a>') == -1 ? urlify(episodeDescription) : episodeDescription);
    $div.find('h1, h2, h3').replaceWith(function () { 
        return $('<b>' + this.innerHTML + '</b>')
    });
    return $div.html();
*/
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
    // TODO: create a new thread to read the feeds
    // Add animation to notify the user about fetching new episodes
    if(!allFavoritePodcasts.isEmpty()) {
        $('#menu-refresh svg').addClass('is-refreshing');
        $('#menu-refresh').off('click');

        let podcasts = allFavoritePodcasts.getAll();
        for (let i in podcasts) {
            allFeeds.lastFeedUrlToReload = podcasts[i].feedUrl;
            readFeedByFeedUrl(podcasts[i].feedUrl);
        }
    }

    // Remove animation to notify the user about fetching new episodes.
    // Let the animation take at least 2 seconds. Otherwise user may not notice it.
    /*
    setTimeout(() => {
        $('#menu-refresh svg').removeClass('is-refreshing');
        $('#menu-refresh').click(readFeeds);
    }, 2000);
    */
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
    // NOTE: Fetch the new episode only if it is not disabled in the podcast settings

    if (isContent302NotFound(_Content))
        makeFeedRequest(getChangedFeed(_Options, _eRequest), updateFeed);
    else {
        if (_Content.includes("<html>")) {
            // TODO: Check strange result content

            // console.log(_Options);
            // console.log(_Content);
        } else  {
            // NOTE: Parse a real feed and just access the last element
            xmlParserWorker.postMessage({
                xml: _Content,
                feedUrl: FeedUrl
            })
        }
    }
}
/*
function getFeedFromWorkerResponse(json, feedUrl) {
    let itemCount = json.length;
    if(itemCount == 0)
        return 0;
    let newEpisodesCount = itemCount - allFeeds.length(feedUrl);
    let indicatorChannel = false;
    for(let i = newEpisodesCount - 1; i >= 0; i--) {
        let episode = json[i];
        indicatorChannel = allFeeds.unsafeAdd(episode);
    }

    if(indicatorChannel)
        allFeeds.updateByIndicator(indicatorChannel); 

    return (newEpisodesCount % itemCount);
}
*/

/*
xmlParserWorker.onmessage = function(ev) {
    let json = ev.data.json;
    let feedUrl = ev.data.feedUrl;

    let initialFeedLength = allFeeds.length(feedUrl);
    let numberNewEpisode = getFeedFromWorkerResponse(json, feedUrl);

    if(initialFeedLength == 0 && numberNewEpisode == 0) {
        allFeeds.ui.showLastNFeedElements(json);
        return;
    }

    for(let i = numberNewEpisode - 1; i >= 0; i--) {
        let episode = json[i]
        allFeeds.ui.add(episode);
    }

    updateFeedAndNewEpisode(feedUrl, numberNewEpisode);
}
*/

xmlParserWorker.onmessage = function(ev) {
    let newFeed = ev.data.json;
    let feedUrl = ev.data.feedUrl;
    let podcastData = ev.data.podcastData;
    let oldFeed = allFeeds.getFeedPodcast(feedUrl);
    oldFeed = !oldFeed ? [] : oldFeed;

    allFavoritePodcasts.setData(feedUrl, podcastData);
    if(!allFeeds.set(newFeed))
        return;

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

    if(initialLength == 0 && new_episodes.length == allFeeds.length(feedUrl)) {
        let $headerDescription = allFeeds.ui.getHeaderDescription().get(0);
        if($headerDescription) {
            let podcast = allFavoritePodcasts.getByFeedUrl(feedUrl);
            $headerDescription.innerHTML = getInfoFromDescription(podcast ? podcast.data.description : '');
        }
        allFeeds.ui.showLastNFeedElements(allFeeds.getFeedPodcast(feedUrl));
    } else {
        for(let i = new_episodes.length - 1; i >= 0; i--) {
            let episode = allFeeds.getEpisode(feedUrl, i);
            allFeeds.ui.add(episode);
        }
    }

    for(let i = deleted_episodes.length - 1; i >= 0; i--) {
        let episodeUrl = deleted_episodes[i];

        allFeeds.ui.remove(feedUrl, episodeUrl);
        allFeeds.playback.remove(episodeUrl)
        allNewEpisodes.removeByEpisodeUrl(episodeUrl);
        allArchiveEpisodes.removeByEpisodeUrl(episodeUrl);
    } 
    
    updateFeedAndNewEpisode(feedUrl, new_episodes.length);
}

function updateFeedAndNewEpisode(feedUrl, numberNewEpisode) {
    if(!getSettings(feedUrl)) {
        for(let i = 0; i < numberNewEpisode; i++) {
            let episode = allFeeds.getEpisode(feedUrl, i);
            if(checkDateIsInTheLastWeek(episode)) 
                allNewEpisodes.add(episode);
            else 
                return;
            
        }
    }
}

function showAllEpisodes(_Self) {
    setGridLayout(false);

    clearBody();
    setHeaderViewAction();

    getAllEpisodesFromFeed(_Self.getAttribute("feedurl"));
}

function getAllEpisodesFromFeed(_Feed) {
    allFeeds.ui.showHeader(_Feed);

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
    let FeedUrl = (_Options instanceof Object ? _Options.path: _Options);
    
    xmlParserWorker.postMessage({
        xml: _Content,
        feedUrl: FeedUrl
    });
}
/*
function showAllFeedElements(feed) {
    let list = $('#list');
    for (let i in feed) {
        let episode = feed[i];
        list.append(allFeeds.ui.getNewItemList(episode));
    }
}
*/

function addToArchive(_Self) {
    let ListElement = _Self.parentElement.parentElement;

    allArchiveEpisodes.add({
        feedUrl: ListElement.getAttribute('feedUrl'),
        episodeUrl: ListElement.getAttribute('url')
    });

}

function removeFromArchive(_Self) {
    let ListElement = _Self.parentElement.parentElement;

    allArchiveEpisodes.removeByEpisodeUrl(ListElement.getAttribute('url'));
}