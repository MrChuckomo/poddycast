var CPlayer = require('./js/helper/player')

var player = new CPlayer()

var allNewEpisodes = null;
var allFeeds = null;

process.dlopen = () => {
  throw new Error('Load native module is not safe')
}
const xmlParserWorker = new Worker('./js/xmlparser_worker.js')

setInterval(function () { 
    readFeeds();
    console.log('Feeds have been read!');
}, 30 * 60 * 1000);

class Episode {
    constructor(ChannelName, FeedUrl, EpisodeTitle, EpisodeUrl, EpisodeType, EpisodeLength, EpisodeDescription, DurationKey, pubDate, playbackPosition) {
        this.channelName = ChannelName;
        this.feedUrl = FeedUrl;
        this.episodeTitle = EpisodeTitle;
        this.episodeUrl = EpisodeUrl;
        this.episodeType = EpisodeType;
        this.episodeLength = EpisodeLength;
        this.episodeDescription = EpisodeDescription;
        this.durationKey = DurationKey;
        this.pubDate = pubDate;
        this.playbackPosition = ( playbackPosition ? playbackPosition : 0 );
    }
}

class FeedsUI {
    constructor() {
    }

    getInfoFeedView() {
        return $('.settings-header').html();
    }

    getArtworkSrcFromView() {
        let $image = $('.settings-image').get(0);
        return ($image ? $image.src : '');
    }

    isEmpity() {
        return !this.getAllItemsList().get(0);
    }

    getList() {
        return $('#list');
    }

    getAllItemsList() {
        return $('#list li');
    }

    add(episode) {
        let pageType = this.getInfoFeedView();
        if(pageType == episode.channelName) {
            this.directAdd(episode);
            this.updateItemCount(episode.feedUrl);
        }
    }

    directAdd(episode) {
        if(!$(this.getAllItemsList().get(0)).get(0)) {
            $(this.getNewItemList(episode))
                .hide()
                .css('opacity', 0.0)
                .appendTo($(this.getList()))
                .slideDown('slow')
                .animate({opacity: 1.0});
        } else
            $(this.getNewItemList(episode))
                .hide()
                .css('opacity', 0.0)
                .insertBefore($(this.getAllItemsList().get(0)))
                .slideDown('slow')
                .animate({opacity: 1.0});
    }

    updateItemCount(FeedUrl) {
        let $count = $('.settings-count').get(0);
        if($count)
            $count.innerHTML = allFeeds.getFeedPodcast(FeedUrl).length;
    }

    getNewItemList(episode) {
        let Artwork = this.getArtworkSrcFromView();

        let ListElement = buildListItem(new cListElement(
            [
                getBoldTextPart(episode.episodeTitle),
                getSubTextPart(new Date(episode.pubDate).toLocaleString()),
                getSubTextPart(allFeeds.getDurationFromDurationKey(episode)),
                getFlagPart('Done', 'white', '#4CAF50'),
                getDescriptionPart(s_InfoIcon, episode.episodeDescription),
                allNewEpisodes.findByEpisodeUrl(episode.episodeUrl) != -1 ? $('<div></div>').get(0) : getAddEpisodeButtonPart()
            ],
            "3fr 1fr 1fr 5em 5em 5em"
        ), eLayout.row)

        if (episodeIsAlreadyInNewEpisodes(episode.episodeUrl))
            ListElement.replaceChild(getIconButtonPart(''), ListElement.children[5])

        if (player.isPlaying(episode.episodeUrl))
            ListElement.classList.add("select-episode")

        // NOTE: Set a episode item to "Done" if it is in the History file

        if (getFileValue(getArchivedFilePath(), "episodeUrl", "episodeUrl", episode.episodeUrl) == null)
            ListElement.replaceChild(getIconButtonPart(''), ListElement.children[3])

        ListElement.onclick = function() {
            playNow(this);
        }
        ListElement.setAttribute("channel", episode.channelName);
        ListElement.setAttribute("feedUrl", episode.feedUrl);
        ListElement.setAttribute("title", episode.episodeTitle);
        ListElement.setAttribute("type", episode.episodeType);
        ListElement.setAttribute("url", episode.episodeUrl);
        ListElement.setAttribute("length", episode.episodeLength);
        ListElement.setAttribute("durationKey", episode.durationKey);
        ListElement.setAttribute("description", episode.episodeDescription);
        ListElement.setAttribute("artworkUrl", Artwork);
        ListElement.setAttribute("pubDate", episode.pubDate);
        
        return ListElement;
    }
}

class Feeds {
    constructor() {
        this.load();
        this.ui = new FeedsUI();
    }

    load() {
        if (!fs.existsSync(getFeedDirPath()))
            fs.mkdirSync(getFeedDirPath());

        if (!fs.existsSync(getIndexFeedFilePath()))
            fs.openSync(getIndexFeedFilePath(), 'w');

        let fileContent = ifExistsReadFile(getIndexFeedFilePath());
        this.index = JSON.parse(fileContent == "" ? "[]": fileContent);
        
        for(let i in this.index) {
            let indicator = this.index[i].indicator;
            if (!fs.existsSync(this.getFeedPathByIndicator(indicator)))
                fs.openSync(this.getFeedPathByIndicator(indicator), 'w');

            let fileContent = ifExistsReadFile(this.getFeedPathByIndicator(indicator));
            this[this.index[i].feedUrl] = JSON.parse(fileContent == '' || fileContent == 'undefined' ? "[]": fileContent);
        }
    }

    updateByFeedUrl(feedUrl) {
        fs.writeFileSync(this.getFeedPathByFeedUrl(feedUrl), JSON.stringify(this[feedUrl], null, "\t"));
    }

    updateByIndicator(indicator) {
        let feedUrl = this.getFeedUrlByIndicator(indicator);
        fs.writeFileSync(this.getFeedPathByIndicator(indicator), JSON.stringify(this[feedUrl], null, "\t"));
    }

    updateIndex() {
        fs.writeFileSync(getIndexFeedFilePath(), JSON.stringify(this.index, null, "\t"));
    }

    updateAll() {
        this.updateIndex();
        for(let i in this.index)
            this.update(this.index[i].feedUrl);
    }

    getFeedPathByIndicator(indicator) {
        return getFeedDirPath() + '/' + indicator + '.json';
    }

    getFeedPathByFeedUrl(feedUrl) {
        return getFeedDirPath() + '/' + this.getIndicatorByFeedUrl(feedUrl) + '.json';
    }

    getIndicatorByFeedUrl(feedUrl) {
        let i = this.getIofIndexByFeedUrl(feedUrl);
        if(i != -1)
            return this.index[i].indicator;
        return undefined;
    }

    getIofIndexByFeedUrl(feedUrl) {
        for(let i in this.index)
            if(this.index[i].feedUrl == feedUrl)
                return i;
        return -1;
    }

    getFeedUrlByIndicator(indicator) {
        for(let i in this.index)
            if(this.index[i].indicator == indicator)
                return this.index[i].feedUrl;
        return undefined;
    }

    length(feedUrl) {
        if(!this[feedUrl])
            return 0;
        return this[feedUrl].length;
    }

    lengthIndex() {
        return this.index.length;
    }

    getNewIndicator() {
        let getNewIndicator = undefined;
        do {
            getNewIndicator = '_' + Math.random().toString(36).substr(2, 9);
        } while(this.getFeedUrlByIndicator(getNewIndicator));
        return getNewIndicator;
    }

    getFeedPodcast(feedUrl) {
        return this[feedUrl];
    }

    getEpisode(feedUrl, i) {
        return this[feedUrl][i];
    }

    getLastEpisode(feedUrl) {
        return this.getEpisode(feedUrl, 0);
    }

    add(episode) {
        let feedUrl = episode.feedUrl;
        let indicator = this.getIndicatorByFeedUrl(feedUrl);
        if(!indicator) {
            indicator = this.getNewIndicator();

            if (!fs.existsSync(this.getFeedPathByIndicator(indicator)))
                fs.openSync(this.getFeedPathByIndicator(indicator), 'w');

            let fileContent = ifExistsReadFile(this.getFeedPathByIndicator(indicator));
            this[feedUrl] = JSON.parse(fileContent == '' || fileContent == 'undefined' ? "[]": fileContent);
            
            this.index.push({feedUrl: feedUrl, indicator: indicator});
            this.updateIndex();
        }

        let lastEpisode = this.getLastEpisode(feedUrl);
        if(!lastEpisode || compareEpisodeDates(episode.pubDate, lastEpisode.pubDate) >= 0) {
            this[feedUrl].unshift(episode);

            this.updateByIndicator(indicator);
            this.ui.add(episode);
            return true;
        }
        return false;
    }

    getDurationFromDurationKey(episode) {
        let duration = parseFeedEpisodeDuration(episode.durationKey.split(":"));

        if (duration.hours == 0 && duration.minutes == 0) 
            duration = "";
        else
            duration = duration.hours + "h " + duration.minutes + "min";
        return duration;
    }

    toNewEpisodeObj(episode) {
        return new NewEpisode(
            episode.channelName,
            episode.feedUrl,
            episode.episodeTitle,
            episode.episodeUrl,
            episode.episodeType,
            episode.episodeLength,
            episode.episodeDescription,
            this.getDurationFromDurationKey(episode),
            episode.pubDate
        )
    }

    delete(feedUrl) {
        let i = this.getIofIndexByFeedUrl(feedUrl);
        let indicator = this.index[i].indicator;
        try {
            fs.unlinkSync(this.getFeedPathByIndicator(indicator));
            delete this[feedUrl];
            this.index.splice(i, 1);
            this.updateIndex();
            console.log('successfully deleted ' + this.getFeedPathByIndicator(indicator));
        } catch (err) {
            console.log('error in deleting ' + this.getFeedPathByIndicator(indicator));
        }
    }

    findEpisodeByEpisodeUrl(feedUrl, episodeUrl) {
        for(let i in this[feedUrl])
            if(this[feedUrl][i].episodeUrl == episodeUrl)
                return i;
        return -1
    }
    
    setPlaybackPositionByEpisodeUrl(feedUrl, episodeUrl, playbackPosition) {
        let i = this.findEpisodeByEpisodeUrl(feedUrl, episodeUrl);
        if(i != -1) {
            this[feedUrl][i].playbackPosition = playbackPosition;
            this.updateByFeedUrl(feedUrl);
        }
    }

    getPlaybackPositionByEpisodeUrl(feedUrl, episodeUrl) {
        let i = this.findEpisodeByEpisodeUrl(feedUrl, episodeUrl);
        if(i != -1)
            return this[feedUrl][i].playbackPosition;
        return undefined;
    }
}

function loadFeeds() {
    allFeeds = new Feeds();
}

function compareEpisodeDates(episode1, episode2) {
    let date1 = new Date(episode1);
    let date2 = new Date(episode2);
    if(date1.getTime() < date2.getTime())
        return -1;
    if(date1.getTime() > date2.getTime())
        return 1;
    return 0;
}

class NewEpisode {
    constructor(channelName, feedUrl, episodeTitle, episodeUrl, episodeType, episodeLength, episodeDescription, duration, pubDate) {
        this.channelName = channelName;
        this.feedUrl = feedUrl;
        this.episodeTitle = episodeTitle;
        this.episodeUrl = episodeUrl;
        this.episodeType = episodeType;
        this.episodeLength = episodeLength;
        this.episodeDescription = episodeDescription;
        this.duration = duration;
        this.pubDate = pubDate;
    }
}

class NewEpisodesUI {
    constructor() {
    }

    getPageType() {
        if(!notPlaylistHeader())
            return 'playlist';
        if(getHeader() == generateHtmlTitle('New Episodes'))
            return 'newEpisodes';
        return undefined;
    }

    isEmpity() {
        return !this.getAllItemsList().get(0);
    }
    
    updateAfterDelete() {
        if(this.isEmpity()) {
            let pageType = this.getPageType();
            switch(pageType) {
                case 'playlist':
                    setNothingToShowBody(s_PlaylistNothingFoundIcon, 'playlist-nothing-to-show');
                    break;
                case 'newEpisodes':
                    setNothingToShowBody(s_NewEpisodesNothingFoundIcon, 'new_episodes-nothing-to-show');
                    break;
            }
        }
    }

    getList() {
        return $('#list');
    }

    getAllItemsList() {
        return $('#list li');
    }

    add(i) {
        let pageType = this.getPageType();
        switch(pageType) {
            case 'playlist':
                this.addPlaylist(i);
                break;
            case 'newEpisodes':
                this.directAdd(i);
                break;
        }
    }

    directAdd(i) {
        if(!$(this.getAllItemsList().get(i)).get(0)) {
            if(this.isEmpity())
                clearBody();
            $(this.getNewItemList(allNewEpisodes.get(i)))
                .hide()
                .css('opacity', 0.0)
                .appendTo($(this.getList()))
                .slideDown('slow')
                .animate({opacity: 1.0});
        } else
            $(this.getNewItemList(allNewEpisodes.get(i)))
                .hide()
                .css('opacity', 0.0)
                .insertBefore($(this.getAllItemsList().get(i)))
                .slideDown('slow')
                .animate({opacity: 1.0});
    }

    addPlaylist(i) {
        let newEpisode = allNewEpisodes.get(i);

        let playlistName = getHeader();
        let indexPlaylist = allPlaylist.memory.findByName(playlistName);
        let feedUrl = newEpisode.feedUrl;
        if(allPlaylist.memory.findPodcast(indexPlaylist, feedUrl) == -1)
            return;

        let playlistEpisodes = allNewEpisodes.getPlaylistEpisodes(playlistName);
        for(let j in playlistEpisodes)
            if(playlistEpisodes[j].episodeUrl == newEpisode.episodeUrl) {
                this.directAdd(j);
                return;
            }
    }

    getNewItemList(newEpisode) {
        let Artwork = getBestArtworkUrl(newEpisode.feedUrl);
        
        let ListElement = buildListItem(new cListElement (
            [
                getImagePart(Artwork),
                getBoldTextPart(newEpisode.episodeTitle),
                getSubTextPart(newEpisode.duration == undefined ? "" : newEpisode.duration),
                getTextPart(newEpisode.channelName),
                getDescriptionPart(s_InfoIcon, newEpisode.episodeDescription),
                getDeleteButtonPart()
            ],
            "5em 1fr 6em 1fr 5em 5em"
        ), eLayout.row)
        
        ListElement.onclick = function() {
            playNow(this);
        };
        ListElement.setAttribute("channel", newEpisode.channelName)
        ListElement.setAttribute("feedUrl", newEpisode.feedUrl)
        ListElement.setAttribute("title", newEpisode.episodeTitle)
        ListElement.setAttribute("type", newEpisode.episodeType)
        ListElement.setAttribute("url", newEpisode.episodeUrl)
        ListElement.setAttribute("length", newEpisode.episodeLength)
        ListElement.setAttribute("artworkUrl", Artwork)
        ListElement.setAttribute("pubDate", newEpisode.pubDate)

        if (player.isPlaying(newEpisode.episodeUrl))
            ListElement.classList.add("select-episode")
        return ListElement;
    }
}

class NewEpisodes {
    constructor() {
        this.load();
        this.ui = new NewEpisodesUI;
    }

    load() {
        if (!fs.existsSync(getNewEpisodesSaveFilePath()))
            fs.openSync(getNewEpisodesSaveFilePath(), 'w');
            
        let fileContent = ifExistsReadFile(getNewEpisodesSaveFilePath());
        this.episodes = JSON.parse(fileContent == "" ? "[]": fileContent);
    }

    update() {
        fs.writeFileSync(getNewEpisodesSaveFilePath(), JSON.stringify(this.episodes, null, "\t"));
    }
    
    length() {
        return this.episodes.length;
    }

    isEmpty() {
        return (this.length() == 0);
    }

    getAll() {
        return this.episodes;
    }

    get(i) {
        return this.episodes[i];
    }
    
    findByEpisodeUrl(episodeUrl) {
        for(let i in this.episodes)
            if(this.episodes[i].episodeUrl == episodeUrl)
                return i;
        return -1;
    }

    getByEpisodeUrl(episodeUrl) {
        let i = this.findByEpisodeUrl(episodeUrl);
        return (i != -1 ? this.episodes[i] : undefined);
    }
    
    add(episode) {
        if(this.findByEpisodeUrl(episode.episodeUrl) == -1) {
            let i = 0;
            while(i < this.length() && compareEpisodeDates(this.episodes[i].pubDate, episode.pubDate) > 0)
                i++;
            this.episodes.splice(i, 0, episode);
            this.update();
            setItemCounts();
            this.ui.add(i);
            return episode;
        } 
        return null;
    }
    
    removeByEpisodeUrl(episodeUrl) {
        let i = this.findByEpisodeUrl(episodeUrl);
        if(i != -1) {
            this.episodes.splice(i, 1);
            this.update();
            return true;
        }
        return false;
    }

    removePodcastEpisodes(feedUrl) {
        for(let i in this.episodes) {
            if(this.episodes[i].feedUrl == feedUrl) 
                this.episodes.splice(i--, 1);
        }
        this.update();
    }

    getPlaylistEpisodes(playlistName) {
        let episodes = [];
        let playlist = allPlaylist.memory.getByName(playlistName);
        if(playlist == undefined)
            return episodes;

        for(let i in this.episodes)
            if(playlist.list.includes(this.episodes[i].feedUrl))
                episodes.push(this.episodes[i]);
        return episodes;
    }

}

function loadNewEpisodes() {
    allNewEpisodes = new NewEpisodes();
}

function readFeeds() {
    // TODO: create a new thread to read the feeds
    // Add animation to notify the user about fetching new episodes
    $('#menu-refresh svg').addClass('is-refreshing');

    let podcasts = allFavoritePodcasts.getAll();
    for (let i in podcasts) 
        readFeedByFeedUrl(podcasts[i].feedUrl);

    // Remove animation to notify the user about fetching new episodes.
    // Let the animation take at least 2 seconds. Otherwise user may not notice it.
    setTimeout(() => {
        $('#menu-refresh svg').removeClass('is-refreshing');
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

function getFeedFromWorkerResponse(json, feedUrl) {
    let itemCount = json.length;
    let newEpisodesCount = itemCount - allFeeds.length(feedUrl);
    for(let i = newEpisodesCount - 1; i >= 0; i--) {
        let episode = json[i];
        allFeeds.add(episode)
    }
    return (newEpisodesCount % itemCount);
}

xmlParserWorker.onmessage = function(ev) {
    let numberNewEpisode = getFeedFromWorkerResponse(ev.data.json, ev.data.feedUrl);

    updateFeedAndNewEpisode(ev.data.feedUrl, numberNewEpisode);
}

function updateFeedAndNewEpisode(FeedUrl, numberNewEpisode) {
    if(!getSettings(FeedUrl)) {
        for(let i = numberNewEpisode - 1; i >= 0; i--) {
            let episode = allFeeds.getEpisode(FeedUrl, i);
            saveEpisode(episode);
        }
    }
}

function showAllEpisodes(_Self) {
    setGridLayout(document.getElementById("list"), false);

    clearBody();
    setHeaderViewAction();

    getAllEpisodesFromFeed(_Self.getAttribute("feedurl"));
}

function getAllEpisodesFromFeed(_Feed) {
    appendSettingsSection(_Feed);

    let Artwork = getBestArtworkUrl(_Feed);

    let feed = allFeeds.getFeedPodcast(_Feed);
    let podcast = allFavoritePodcasts.getByFeedUrl(_Feed);

    // NOTE: set settings information
    $('.settings-image').get(0).src = Artwork;
    $('.settings-header').get(0).innerHTML = (podcast ? podcast.collectionName : 'null');
    $('.settings-count').get(0).innerHTML = (feed ? feed.length : "-1");

    showAllFeedElements(feed);

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

function appendSettingsSection(_Feed) {
    // NOTE: settings area in front of a podcast episode list

    var RightContent = document.getElementById("list")

    var SettingsDiv = document.createElement("div")
    SettingsDiv.classList.add("settings")

    var PodcastImage = document.createElement("img")
    PodcastImage.classList.add("settings-image")

    var podcastName = document.createElement("div")
    podcastName.classList.add("settings-header")

    var EpisodeCount = document.createElement("div")
    EpisodeCount.classList.add("settings-count")

    var MoreElement = document.createElement("div")
    MoreElement.innerHTML = s_MoreOptionIcon
    MoreElement.classList.add("settings-unsubscribe")

    // NOTE: set context menu

    setPodcastSettingsMenu(MoreElement, _Feed)

    // NOTE: build layout

    SettingsDiv.append(PodcastImage)
    SettingsDiv.append(podcastName)
    SettingsDiv.append(EpisodeCount)
    SettingsDiv.append(MoreElement)

    RightContent.append(SettingsDiv)
}

function setPodcastSettingsMenu(_Object, _Feed)
{
    const {remote} = require('electron')
    const {Menu, MenuItem} = remote

    const PlaylistMenu = new Menu();
    
    let JsonContent = allPlaylist.memory.playlists;

    for (let i in JsonContent) {
        let IsInPlaylist = isAlreadyInPlaylist(JsonContent[i].name, _Feed)

        PlaylistMenu.append(new MenuItem({
            label: JsonContent[i].name, 
            type: "checkbox", 
            checked: IsInPlaylist, 
            click(self) {
                let playlistName = self.label;
                if(self.checked)
                    addToPlaylist(playlistName, _Feed);
                else
                    removeFromPlaylist(playlistName, _Feed);

            }
        }))
    }

    const ContextMenu = new Menu()
    ContextMenu.append(new MenuItem({label: i18n.__('Add to playlist'), submenu: PlaylistMenu}))
    ContextMenu.append(new MenuItem({type: 'separator'}))
    ContextMenu.append(new MenuItem({label: i18n.__('Push to New Episodes'), type: 'checkbox', checked: !getSettings(_Feed), click(self) {
        changeSettings(_Feed, !self.checked);
    }}))
    ContextMenu.append(new MenuItem({type: 'separator'}))
    ContextMenu.append(new MenuItem({label: i18n.__('Unsubscribe'), click() {
        if (_Feed != null)
            unsubscribeContextMenu(_Feed);
    }}))

    _Object.addEventListener('click', (_Event) => {
        _Event.preventDefault()
        ContextMenu.popup(remote.getCurrentWindow(), { async:true })
    }, false)

}

function processEpisodes(_Content, _Options) {
    let FeedUrl = (_Options instanceof Object ? _Options.path: _Options);
    
    xmlParserWorker.postMessage({
        xml: _Content,
        feedUrl: FeedUrl
    });
}

function showAllFeedElements(feed) {
    let list = $('#list');
    for (let i in feed) {
        let episode = feed[i];
        list.append(allFeeds.ui.getNewItemList(episode));
    }
}

function addToEpisodes(_Self) {
    let ListElement = _Self.parentElement.parentElement;

    let episode = new Episode(
        ListElement.getAttribute("channel"),
        ListElement.getAttribute("feedUrl"),
        ListElement.getAttribute("title"),
        ListElement.getAttribute("url"),
        ListElement.getAttribute("type"),
        ListElement.getAttribute("length"),
        ListElement.getAttribute("description"),
        ListElement.getAttribute("durationKey"),
        ListElement.getAttribute("pubDate")
    );
    
    saveEpisode(episode)

    _Self.innerHTML = "";
}

function saveEpisode(episode) {
    let newEpisode = allFeeds.toNewEpisodeObj(episode);

    allNewEpisodes.add(newEpisode);
}
