var CPlayer = require('./js/helper/player')

var player = new CPlayer()

var allNewEpisodes = null;
var allFeeds = null;

class Episode {
    constructor(ChannelName, EpisodeTitle, EpisodeUrl, EpisodeType, EpisodeLength, EpisodeDescription, DurationKey, pubDate, playbackPosition) {
        this.channelName = ChannelName;
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

class Feeds {
    constructor() {
        this.load();
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
            this[this.index[i].channelName] = JSON.parse(fileContent == '' || fileContent == 'undefined' ? "[]": fileContent);
        }
    }

    updateByChannelName(channelName) {
        fs.writeFileSync(this.getFeedPathByChannelName(channelName), JSON.stringify(this[channelName], null, "\t"));
    }

    updateByIndicator(indicator) {
        let channelName = this.getChannelNameByIndicator(indicator);
        fs.writeFileSync(this.getFeedPathByIndicator(indicator), JSON.stringify(this[channelName], null, "\t"));
    }

    updateIndex() {
        fs.writeFileSync(getIndexFeedFilePath(), JSON.stringify(this.index, null, "\t"));
    }

    updateAll() {
        this.updateIndex();
        for(let i in this.index)
            this.update(this.index[i].channelName);
    }

    getFeedPathByIndicator(indicator) {
        return getFeedDirPath() + '/' + indicator + '.json';
    }

    getFeedPathByChannelName(channelName) {
        return getFeedDirPath() + '/' + this.getIndicatorByChannelName(channelName) + '.json';
    }

    getIndicatorByChannelName(channelName) {
        let i = this.getIofIndexByChannelName(channelName);
        if(i != -1)
            return this.index[i].indicator;
        return undefined;
    }

    getIofIndexByChannelName(channelName) {
        for(let i in this.index)
            if(this.index[i].channelName == channelName)
                return i;
        return -1;
    }

    getChannelNameByIndicator(indicator) {
        for(let i in this.index)
            if(this.index[i].indicator == indicator)
                return this.index[i].channelName;
        return undefined;
    }

    length(channelName) {
        if(!this[channelName])
            return 0;
        return this[channelName].length;
    }

    lengthIndex() {
        return this.index.length;
    }

    getNewIndicator() {
        let getNewIndicator = undefined;
        do {
            getNewIndicator = '_' + Math.random().toString(36).substr(2, 9);
        } while(this.getChannelNameByIndicator(getNewIndicator));
        return getNewIndicator;
    }

    getFeedPodcast(channelName) {
        return this[channelName];
    }

    getEpisode(channelName, i) {
        return this[channelName][i];
    }

    getLastEpisode(channelName) {
        return this.getEpisode(channelName, 0);
    }

    add(episode) {
        let channelName = episode.channelName;
        let indicator = this.getIndicatorByChannelName(channelName);
        if(!indicator) {
            indicator = this.getNewIndicator();

            if (!fs.existsSync(this.getFeedPathByIndicator(indicator)))
                fs.openSync(this.getFeedPathByIndicator(indicator), 'w');

            let fileContent = ifExistsReadFile(this.getFeedPathByIndicator(indicator));
            this[channelName] = JSON.parse(fileContent == '' || fileContent == 'undefined' ? "[]": fileContent);
            
            this.index.push({channelName: channelName, indicator: indicator});
            this.updateIndex();
        }

        let lastEpisode = this.getLastEpisode(channelName);
        if(!lastEpisode || compareEpisodeDates(episode.pubDate, lastEpisode.pubDate) > 0) {
            this[channelName].unshift(episode);

            this.updateByIndicator(indicator);
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
            episode.episodeTitle,
            episode.episodeUrl,
            episode.episodeType,
            episode.episodeLength,
            episode.episodeDescription,
            this.getDurationFromDurationKey(episode),
            episode.pubDate
        )
    }

    getFeedFromXml($xml) {
        let channelName = getChannelNameFromXml($xml);
        let itemCount = $xml.find('item').length;
        let newEpisodesCount = itemCount - this.length(channelName);
        for(let i = newEpisodesCount - 1; i >= 0; i--) {
            let episode = getEpisodeObjFromXml($xml, i);
            this.add(episode)
        }
        return (newEpisodesCount % itemCount);
    }

    delete(channelName) {
        let i = this.getIofIndexByChannelName(channelName);
        let indicator = this.index[i].indicator;
        try {
            fs.unlinkSync(this.getFeedPathByIndicator(indicator));
            delete this[channelName];
            this.index.splice(i, 1);
            this.updateIndex();
            console.log('successfully deleted ' + this.getFeedPathByIndicator(indicator));
        } catch (err) {
            console.log('error in deleting ' + this.getFeedPathByIndicator(indicator));
        }
    }

    findEpisodeByEpisodeUrl(channelName, episodeUrl) {
        for(let i in this[channelName])
            if(this[channelName][i].episodeUrl == episodeUrl)
                return i;
        return -1
    }
    
    setPlaybackPositionByEpisodeUrl(channelName, episodeUrl, playbackPosition) {
        let i = this.findEpisodeByEpisodeUrl(channelName, episodeUrl);
        if(i != -1) {
            this[channelName][i].playbackPosition = playbackPosition;
            this.updateByChannelName(channelName);
        }
    }

    getPlaybackPositionByEpisodeUrl(channelName, episodeUrl) {
        let i = this.findEpisodeByEpisodeUrl(channelName, episodeUrl);
        if(i != -1)
            return this[channelName][i].playbackPosition;
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
    constructor(channelName, episodeTitle, episodeUrl, episodeType, episodeLength, episodeDescription, duration, pubDate) {
        this.channelName = channelName;
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
        if(!$(this.getAllItemsList().get(i)).get(0))//(i == 0 && this.isEmpity()) || i == allNewEpisodes.length() - 1)
            this.getList().append(this.getNewItemList(i));
        else
            $(this.getAllItemsList().get(i)).before(this.getNewItemList(i));
    }

    addPlaylist(i) {
        let newEpisode = allNewEpisodes.get(i);

        let playlistName = getHeader();
        let indexPlaylist = allPlaylist.memory.findByName(playlistName);
        let podcastName = newEpisode.channelName;
        if(allPlaylist.memory.findPodcast(indexPlaylist, podcastName) == -1)
            return;

        let playlistEpisodes = allNewEpisodes.getPlaylistEpisodes(playlistName);
        for(let j in playlistEpisodes)
            if(playlistEpisodes[j].episodeUrl == newEpisode.episodeUrl) {
                this.directAdd(j);
                return;
            }
    }

    getNewItemList(newEpisode) {
        let Artwork = getBestArtworkUrl(newEpisode.channelName);
        
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
        ListElement.setAttribute("title", newEpisode.episodeTitle)
        ListElement.setAttribute("type", newEpisode.episodeType)
        ListElement.setAttribute("url", newEpisode.episodeUrl)
        ListElement.setAttribute("length", newEpisode.episodeLength)
        ListElement.setAttribute("artworkUrl", Artwork)

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

    findByTitle(title) {
        for(let i in this.episodes)
            if(this.episodes[i].episodeTitle == title)
                return i;
        return -1;
    }

    getByTitle(title) {
        let i = this.findByTitle(title);
        return (i != -1 ? this.episodes[i] : undefined);
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

    findByTitleAndChannel(title, channel) {
        for(let i in this.episodes)
            if(this.episodes[i].episodeTitle == title && this.episodes[i].channelName == channel)
                return i;
        return -1;
    }

    getByTitleAndChannel(title, channel) {
        let i = this.findByTitleAndChannel(title, channel);
        return (i != -1 ? this.episodes[i] : undefined);
    }

    add(episode) {
        if(this.findByTitleAndChannel(episode.episodeTitle, episode.channelName) == -1) {
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

    removeByTitle(title) {
        let i = this.findByTitle(title);
        if(i != -1) {
            this.episodes.splice(i, 1);
            this.update();
            return true;
        }
        return false;
    }

    removeByTitleAndChannel(title, channel) {
        let i = this.findByTitleAndChannel(title, channel);
        if(i != -1) {
            this.episodes.splice(i, 1);
            this.update();
            return true;
        }
        return false;
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

    removePodcastEpisodes(podcast) {
        for(let i in this.episodes) {
            if(this.episodes[i].channelName == podcast) 
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
            if(playlist.list.includes(this.episodes[i].channelName))
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
    for (let i in podcasts) {
        if (isProxySet()) 
            makeFeedRequest(getFeedProxyOptions(podcasts[i].feedUrl), updateFeed);
        else 
            makeFeedRequest(podcasts[i].feedUrl, updateFeed);
    }

    // Remove animation to notify the user about fetching new episodes.
    // Let the animation take at least 2 seconds. Otherwise user may not notice it.
    setTimeout(() => {
        $('#menu-refresh svg').removeClass('is-refreshing');
    }, 2000);
}

function updateFeed(_Content, _eRequest, _Options) {
    let FeedUrl = (_Options instanceof Object ? _Options.path: _Options);

    // NOTE: Fetch the new episode only if it is not disabled in the podcast settings

    //if (getSettings(FeedUrl)) {
    if (isContent302NotFound(_Content))
        makeFeedRequest(getChangedFeed(_Options, _eRequest), updateFeed);
    else {
        if (_Content.includes("<html>")) {
            // TODO: Check strange result content

            // console.log(_Options);
            // console.log(_Content);
        } else  {
            // NOTE: Parse a real feed and just access the last element
            let $xml = $($.parseXML(_Content));
            updateFeedAndNewEpisode($xml, FeedUrl);
        }
    }
    //}
}

function updateFeedAndNewEpisode($xml, FeedUrl) {
    let channelName = getChannelNameFromXml($xml);
    let numberNewEpisode = allFeeds.getFeedFromXml($xml);
    // NOTE: save latest episode if not already in History
    if(!getSettings(FeedUrl)) {
        for(let i = 0; i < numberNewEpisode; i++) {
            let episode = allFeeds.getEpisode(channelName, i);
            //if (getFileValue(getArchivedFilePath(), "episodeUrl", "episodeUrl", episode.episodeUrl) == null)
                saveEpisode(episode);
        }
    }
}

function getChannelNameFromXml($xml) {
    return $xml.find('channel title').get(0).childNodes[0].nodeValue;
}

function getEpisodeObjFromXml($xml, i) {
    let enclosure = $xml.find('item enclosure').get(i);
    let description = '';
    if($xml.find('item itunes:subtitle').get(i))
        description = $xml.find('item itunes\\:subtitle').get(i).textContent;
    else if($xml.find('item description').get(i))
        description = $xml.find('item description').get(i).textContent;
    let duration = null;
    if($xml.find('item itunes\\:duration').get(i))
        duration = $xml.find('item itunes\\:duration').get(i).innerHTML;
    else
        duration = $xml.find('item duration').get(i).innerHTML;

    let episode = new Episode(
        getChannelNameFromXml($xml),
        $xml.find('item title').get(i).childNodes[0].nodeValue,
        (enclosure ? enclosure.getAttribute('url') : ''),
        (enclosure ? enclosure.getAttribute('type') : ''),
        (enclosure ? enclosure.getAttribute('length') : ''),
        getEpisodeInfoFromDescription(description),
        duration,
        $xml.find('item pubDate').get(i).innerHTML
    );
    return episode;
}

function showAllEpisodes(_Self) {
    setGridLayout(document.getElementById("list"), false);

    clearBody();
    setHeaderViewAction();

    getAllEpisodesFromFeed(_Self.getAttribute("feedurl"));
}

function getAllEpisodesFromFeed(_Feed) {
    let PodcastName = allFavoritePodcasts.getByFeedUrl(_Feed).collectionName;

    appendSettingsSection(PodcastName, _Feed);

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

function appendSettingsSection(_PodcastName, _Feed) {
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

    setPodcastSettingsMenu(MoreElement, _PodcastName, _Feed)

    // NOTE: build layout

    SettingsDiv.append(PodcastImage)
    SettingsDiv.append(podcastName)
    SettingsDiv.append(EpisodeCount)
    SettingsDiv.append(MoreElement)

    RightContent.append(SettingsDiv)
}

function setPodcastSettingsMenu(_Object, _PodcastName, _Feed)
{
    const {remote} = require('electron')
    const {Menu, MenuItem} = remote

    const PlaylistMenu = new Menu()

    let fileContent = ifExistsReadFile(getPlaylistFilePath());

    if (fileContent != "") {
        var JsonContent = JSON.parse(fileContent);

        for (let i in JsonContent) {
            var IsInPlaylist = isAlreadyInPlaylist(JsonContent[i].playlistName, _PodcastName)

            PlaylistMenu.append(new MenuItem({
                label: JsonContent[i].playlistName, 
                type: "checkbox", 
                checked: IsInPlaylist, 
                click(self) {
                    let playlistName = self.label;
                    let PodcastName = document.getElementsByClassName("settings-header")[0].innerHTML
                    addToPlaylist(playlistName, PodcastName);
                }
            }))
        }
    }

    const ContextMenu = new Menu()
    ContextMenu.append(new MenuItem({label: i18n.__('Add to playlist'), submenu: PlaylistMenu}))
    ContextMenu.append(new MenuItem({type: 'separator'}))
    ContextMenu.append(new MenuItem({label: i18n.__('Push to New Episodes'), type: 'checkbox', checked: !getSettings(_Feed), click(self) {
        //if (isInSettings(_Feed))
        //{
        //    changeSettings(_Feed, self.checked)
        //}
        //else
        //{
        //    addToSettings(_PodcastName, _Feed)
            changeSettings(_Feed, !self.checked)
        //}
    }}))
    ContextMenu.append(new MenuItem({type: 'separator'}))
    ContextMenu.append(new MenuItem({label: i18n.__('Unsubscribe'), click() {
        if (_PodcastName != null)
            unsubscribeContextMenu(_Feed);
    }}))

    _Object.addEventListener('click', (_Event) => {
        _Event.preventDefault()
        ContextMenu.popup(remote.getCurrentWindow(), { async:true })
    }, false)

}

function processEpisodes(_Content, _Options) {
    let FeedUrl = (_Options instanceof Object ? _Options.path: _Options);
    let $xml = $($.parseXML(_Content));
    
    updateFeedAndNewEpisode($xml, FeedUrl);

    let ChannelName = getChannelNameFromXml($xml);

    let Artwork = getBestArtworkUrl(ChannelName, true);

    if (isGenericArtwork(Artwork)) 
        Artwork = getArtworkFromFeed($xml.get(0));

    // NOTE: set settings information
    let feed = allFeeds.getFeedPodcast(ChannelName);
    $('.settings-image').get(0).src = Artwork;
    $('.settings-header').get(0).innerHTML = ChannelName;
    $('.settings-count').get(0).innerHTML = feed.length;

    let List = document.getElementById("list")

    for (let i in feed) {

        // NOTE: Just enter if the current item contains an enclosure tag
        
        //if ($xml.find('item enclosure').length > 0) {
            let episode = feed[i];

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

            if (episodeIsAlreadyInNewEpisodes(episode.episodeTitle, ChannelName))
                ListElement.replaceChild(getIconButtonPart(''), ListElement.children[5])

            if (player.isPlaying(episode.episodeUrl))
                ListElement.classList.add("select-episode")

            // NOTE: Set a episode item to "Done" if it is in the History file

            if (getFileValue(getArchivedFilePath(), "episodeUrl", "episodeUrl", episode.episodeUrl) == null)
                ListElement.replaceChild(getIconButtonPart(''), ListElement.children[3])

            ListElement.setAttribute("onclick", "playNow(this)");
            ListElement.setAttribute("channel", episode.channelName);
            ListElement.setAttribute("title", episode.episodeTitle);
            ListElement.setAttribute("type", episode.episodeType);
            ListElement.setAttribute("url", episode.episodeUrl);
            ListElement.setAttribute("length", episode.episodeLength);
            ListElement.setAttribute("durationKey", episode.durationKey);
            ListElement.setAttribute("description", episode.episodeDescription);
            ListElement.setAttribute("artworkUrl", Artwork);
            ListElement.setAttribute("pubDate", episode.pubDate);

            List.append(ListElement)
        //}
    }
}

function addToEpisodes(_Self) {
    let ListElement = _Self.parentElement.parentElement;

    let episode = new Episode(
        ListElement.getAttribute("channel"),
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
