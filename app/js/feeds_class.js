var CPlayer = require('./js/helper/player')
var player = new CPlayer()

var allFeeds = null;

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
        this.firstEpisodeDisplayed = null;
        this.lastEpisodeDisplayed = null;
        this.bufferSize = 200;
    }

/*
 * HEADER
 */

    getHeader() {
        return $('.settings');
    }

    getHeaderImage() {
        return $('.settings .settings-image');
    }

    getHeaderTitle() {
        return $('.settings .settings-header');
    }

    getHeaderCount() {
        return $('.settings .settings-count');
    }

    setHeaderCountValue(n) {
        this.getHeaderCount().get(0).innerHTML = n;
    }

    showHeader(feedUrl) {
        this.appendHeaderSection(feedUrl);

        let Artwork = getBestArtworkUrl(feedUrl);

        //let feed = allFeeds.getFeedPodcast(feedUrl);
        let podcast = allFavoritePodcasts.getByFeedUrl(feedUrl);

        // NOTE: set settings information
        this.getHeaderImage().get(0).src = Artwork;
        this.getHeaderTitle().get(0).innerHTML = (podcast ? podcast.collectionName : 'null');
        this.getHeaderCount().get(0).innerHTML = (podcast ? '0' : '-1'); //(feed ? feed.length : (podcast ? '0' : '-1'));

    }

    appendHeaderSection(_Feed) {
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

        this.setPodcastHeaderMenu(MoreElement, _Feed)

        // NOTE: build layout

        SettingsDiv.append(PodcastImage)
        SettingsDiv.append(podcastName)
        SettingsDiv.append(EpisodeCount)
        SettingsDiv.append(MoreElement)

        let podcast = allFavoritePodcasts.getByFeedUrl(_Feed);
        if(podcast)
            $(SettingsDiv).attr({
                collectionName: podcast.collectionName,
                feedUrl: podcast.feedUrl
            });

        RightContent.append(SettingsDiv)
    }
        
    setPodcastHeaderMenu(_Object, _Feed) {
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

/*
 * PAGE
 */

    isFavoritesPage() {
        return (getHeader() == generateHtmlTitle('Favorites'));
    }

    getInfoFeedView() {
        let $header = this.getHeader();
        if(!$header.get(0))
            return undefined;
        return {
            collectionName: $header.attr('collectionname'),
            feedUrl: $header.attr('feedurl')
        }
    }

    getFeedUrlByHeader() {
        let infoFeed = this.getInfoFeedView();
        if(infoFeed)
            return infoFeed.feedUrl;
        else
            return undefined;
    }

    getCollectionNameByHeader() {
        let infoFeed = this.getInfoFeedView();
        if(infoFeed)
            return infoFeed.collectionName;
        else
            return undefined;
    }

    getArtworkSrcFromView() {
        let $image = this.getHeaderImage().get(0);
        return ($image ? $image.src : '');
    }

    checkPageByFeedUrl(feedUrl) {
        let infoFeed = this.getInfoFeedView();
        return (this.isFavoritesPage() && infoFeed && infoFeed.feedUrl == feedUrl); 
    }   

/*
 * LIST
 */

    listIsEmpity() {
        return !this.getAllItemsList().get(0);
    }

    getList() {
        return $('#list');
    }

    getAllItemsList() {
        return $('#list li');
    }

    getFirstItemList() {
        return $(this.getAllItemsList().get(0));
    }

    getItemListByIndex(i) {
        return $(this.getAllItemsList().get(i));
    }

    add(episode) {
        if(this.checkPageByFeedUrl(episode.feedUrl)) {
            this.lastEpisodeDisplayed++;
            if(this.firstEpisodeIsDisplayed()) {
                this.directAdd(episode);
                this.updateItemCount(episode.feedUrl);
            } else {
                this.firstEpisodeDisplayed++;
                console.log(this.firstEpisodeDisplayed)
            }
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

    convertItemIntoInfoItemList(obj) {
        let $obj = $(obj);
        $obj.attr('info-mode', '');
        let $descriptionItem = $obj.find('.list-item-description');
        $obj.off('click');
        
        $obj.find('div').not(".list-item-description").css('display', 'none');
        $obj.css('grid-template-columns', '1fr 5em 5em');
        $descriptionItem.before(
            '<span id="info-item-list" style="opacity: 0;">' + 
                '<br>' +
                '<span style="font-size:16px;font-weight:bold;">' +
                    $obj.attr('title') +
                '</span>' +
                '<br>' +
                '<span style="font-size:13px;opacity:0.7;">' +
                    $obj.find('.list-item-sub-text').get(1).innerHTML +
                '</span>' +
                '<br>' +
                '<span style="font-size:15px;">' +
                    //$descriptionItem.attr('title') +
                    getEpisodeInfoFromDescription($descriptionItem.attr('description')) +
                '</span>' +
                '<br>' +
                '<span style="font-size:13px;opacity:0.7;">' +
                    $obj.find('.list-item-sub-text').get(0).innerHTML +
                '</span>' +
                '<br>' +
                '<br>' +
            '</span>'
        );
        
        $obj.find('#info-item-list')
            .stop()
            .animate({opacity: 1.0}, 500)
        
        $descriptionItem.html(s_ArrowUpIcon);
        
        let initialHeight = $obj.css('height');
        $obj.css('height', 'auto');
        let autoHeight = $obj.css('height');
        $obj.css('height', initialHeight);
        
        $obj
            .stop()
            .animate(
                {height: autoHeight},
                300, 
                function () {
                    $obj.css('height', 'auto');
                });
    }

    convertInfoItemIntoItemList(obj) {
        if(obj) {
            let height = obj.offsetHeight;
            let $obj = $(obj);
            $obj.removeAttr('info-mode');

            $obj.click(function(e) {
                if($(e.target).is('svg') || $(e.target).is('path') || $(e.target).hasClass('list-item-icon')) {
                    e.preventDefault();
                    return;
                }
                playNow(this);
            });

            $obj.find('div').removeAttr('style');
            $obj.css('grid-template-columns', '3fr 1fr 1fr 5em 5em 5em');
            
            $obj
                .css('background-color', '')
                .css('height', height)
                .stop()
                .animate(
                    {height: '2.7em'},
                    300,
                    function () {
                        $obj.css('height', '');
                    }); 

            $obj.find('#info-item-list').remove();
            
            $obj.find('.list-item-description')
                .html(s_InfoIcon);
            
            $obj.find('.list-item-flag')
                .css('background-color', '#4CAF50')
        }
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

        $(ListElement).click(function(e) {
            if($(e.target).is('svg') || $(e.target).is('path') || $(e.target).hasClass('list-item-icon')) {
                e.preventDefault();
                return;
            }
            playNow(this);
        });
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

        $(ListElement).find('.list-item-description').click(() => {
            if($(ListElement).is('[info-mode]'))
                this.convertInfoItemIntoItemList(ListElement)
            else {
                this.convertInfoItemIntoItemList(this.getAllItemsList().filter('[info-mode]').get(0))
                this.convertItemIntoInfoItemList(ListElement)
            }
        })
        
        return ListElement;
    }

    showLastNFeedElements(feed) {
        if(!feed || !this.checkPageByFeedUrl(this.getFeedUrlByHeader()))
            return;
        
        this.setHeaderCountValue(feed.length);
        
        let $list = this.getList();

        let length = (feed.length < this.bufferSize ? feed.length : this.bufferSize);

        for (let i = 0; i < length; i++) {
            let episode = feed[i];
            $list.append(this.getNewItemList(episode));
        }

        this.firstEpisodeDisplayed = 0;
        this.lastEpisodeDisplayed = length - 1;
        
        this.appendShowMoreEpisodesButton();
        this.prependShowMoreEpisodesButton();

        if(length != feed.length)
            this.getShowMoreEpisodesBottomElement().show();

        setScrollPositionOnTop();
    }

    lastEpisodeIsDisplayed(feed) {
        return (this.lastEpisodeDisplayed == feed.length - 1);
    }

    firstEpisodeIsDisplayed() {
        return (this.firstEpisodeDisplayed == 0);
    }

    getShowMoreEpisodesHtml(text, className) {
        if(!className)
            className = '';
        return '<div class="show-more-episodes-row ' + className + '" style="display:none;">' +
                    '<span class="show-more-episodes-button">' +
                        i18n.__(text) + 
                    '</span>' +
                '</div>';
    }

    getShowMoreEpisodesBottomHtml() {
        return this.getShowMoreEpisodesHtml('Show more episodes', 'more-episodes-bottom');
    }

    getShowMoreEpisodesTopHtml() {
        return this.getShowMoreEpisodesHtml('Show more recent episodes', 'more-episodes-top');
    }

    getShowMoreEpisodesBottomElement() {
        return this.getList().find('.more-episodes-bottom');
    }

    getShowMoreEpisodesTopElement() {
        return this.getList().find('.more-episodes-top');
    }

    showOther10Elements(feed) {
        let i = this.lastEpisodeDisplayed + 1;
        let delay = 0;
        while(i < feed.length && i < this.lastEpisodeDisplayed + 11) {
            let episode = feed[i];
            $(this.getNewItemList(episode))
                .delay(140 * delay++)
                .hide()
                .css('opacity', 0.0)
                .insertBefore(this.getShowMoreEpisodesBottomElement())
                .slideDown(100,function () {
                    $(this).animate({opacity: 1.0});
                });

            i++;
        }
        this.lastEpisodeDisplayed = i - 1;
    }

    showsPrevious10Elements(feed) {
        let i = this.firstEpisodeDisplayed - 1;
        let delay = 0;
        while(i >= 0 && i >= this.firstEpisodeDisplayed - 10) {
            let episode = feed[i];
            $(this.getNewItemList(episode))
                .delay(140 * delay++)
                .hide()
                .css('opacity', 0.0)
                .insertBefore(this.getFirstItemList())
                .slideDown(100, function () {
                    $(this).animate({opacity: 1.0}, 200);
                });
            
            i--;
        }
        this.firstEpisodeDisplayed = i + 1;
    }

    removeExtraPreviousElements() {
        let nElement = this.getAllItemsList().length - this.bufferSize;
        this.getAllItemsList()
            .slice(0, nElement)
            .remove();
        this.firstEpisodeDisplayed += nElement;

        this.getShowMoreEpisodesTopElement().show();
    }

    removeExtraNextElements() {
        let nElement = this.bufferSize - this.getAllItemsList().length;
        this.getAllItemsList()
            .slice(nElement)
            .remove();

        this.lastEpisodeDisplayed += nElement;

        this.getShowMoreEpisodesBottomElement().show();
    }

    appendShowMoreEpisodesButton() {
        this.getList()
            .append(this.getShowMoreEpisodesBottomHtml())

        function clickFunction(obj) {
            let $button = obj.getList().find('.more-episodes-bottom').find('.show-more-episodes-button');
            $button.off('click');
            
            let feedUrl = obj.getFeedUrlByHeader();
            let feed = allFeeds.getFeedPodcast(feedUrl);

            obj.showOther10Elements(feed);
            obj.removeExtraPreviousElements();
            console.log("_ ", obj.firstEpisodeDisplayed, obj.lastEpisodeDisplayed)

            if(obj.lastEpisodeIsDisplayed(feed)) {
                let $showMoreEpisodesRowBottom = obj.getShowMoreEpisodesBottomElement();

                $showMoreEpisodesRowBottom
                    .css('opacity', 0.7)
                    .animate({opacity: 0.0}, 150)
                    .slideUp(150, () => { 
                        $showMoreEpisodesRowBottom.hide(); 
                        $showMoreEpisodesRowBottom.css('opacity', ''); 
                        
                        $button.click(() => {
                            clickFunction(obj);
                        });
                    });
            } else {
                $button.click(() => {
                    clickFunction(obj);
                });
            }
        }

        this.getList().find('.more-episodes-bottom').find('.show-more-episodes-button')
            .click(() => {
                clickFunction(this);
            });
    }

    prependShowMoreEpisodesButton() {
        this.getHeader()
            .after(this.getShowMoreEpisodesTopHtml())

        function clickFunction(obj) {
            let $button = obj.getList().find('.more-episodes-top').find('.show-more-episodes-button');
            $button.off('click');
            
            let feedUrl = obj.getFeedUrlByHeader();
            let feed = allFeeds.getFeedPodcast(feedUrl);

            obj.showsPrevious10Elements(feed);
            let timeout = 130 * (obj.getAllItemsList().length - obj.bufferSize);
            obj.removeExtraNextElements();
            console.log("^", obj.firstEpisodeDisplayed, obj.lastEpisodeDisplayed)
            
            if(obj.firstEpisodeIsDisplayed()) {
                let $showMoreEpisodesRowTop = obj.getShowMoreEpisodesTopElement();
                
                $showMoreEpisodesRowTop
                    .css('opacity', 0.7)
                    .animate({opacity: 0.0}, 150)
                    .slideUp(150, () => { 
                        $showMoreEpisodesRowTop.hide(); 
                        $showMoreEpisodesRowTop.css('opacity', ''); 

                        setTimeout(() => {
                            $button.click(() => {
                                clickFunction(obj);
                            });
                        }, timeout);
                    });
            } else {
                setTimeout(() => {
                    $button.click(() => {
                        clickFunction(obj);
                    });
                }, timeout);
            }
        }

        this.getList().find('.more-episodes-top').find('.show-more-episodes-button')
            .click(() => {
                clickFunction(this);
            });
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
        let indicator = this.unsafeAdd(episode);
        if(indicator) {
            this.ui.add(episode);
            this.updateByIndicator(indicator);
            return true;
        }
        return false;
    }

    unsafeAdd(episode) {
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

            return indicator;
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