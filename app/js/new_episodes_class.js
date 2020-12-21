var allNewEpisodes = null;

class NewEpisodesUI extends ListUI {

    showNothingToShow() {
        if(this.isNewEpisodesPage()) 
            super.showNothingToShow(s_NewEpisodesNothingFoundIcon, 'new_episodes-nothing-to-show');
        else if(this.isPlaylistPage())
            super.showNothingToShow(s_PlaylistNothingFoundIcon, 'playlist-nothing-to-show');
    }

    isNewEpisodesPage() {
        return (this.getPageType() == 'newEpisodes');
    }

    isPlaylistPage() {
        return (this.getPageType() == 'playlist');
    }

    add(episode, i) {
        setItemCounts();
        if(this.isNewEpisodesPage() || this.isPlaylistPage())
            super.add(episode, i);
    }


    directAdd(episode, i, forceOriginalDirectAdd) {
        if(this.isNewEpisodesPage() || forceOriginalDirectAdd)
            super.directAdd(episode, i);
        else if(this.isPlaylistPage())
            this.addPlaylist(episode);
    }
    
    addPlaylist(episode) {
        let playlistName = getHeader();
        let indexPlaylist = allPlaylist.memory.findByName(playlistName);
        let feedUrl = episode.feedUrl;
        if(allPlaylist.memory.findPodcast(indexPlaylist, feedUrl) == -1)
            return;

        let playlistEpisodes = this.dataObject.getPlaylistEpisodes(playlistName);
        for(let j in playlistEpisodes)
            if(playlistEpisodes[j].episodeUrl == episode.episodeUrl) {
                this.directAdd(episode, j - this.firstEpisodeDisplayed, true);
                return;
            }
    }

    removeByEpisodeUrl(episodeUrl) {
        setItemCounts();
        if(this.isNewEpisodesPage() || this.isPlaylistPage()) 
            super.removeByEpisodeUrl(episodeUrl);
    }

    /*
    showAll() {
        if(this.dataObject.isEmpty())
            this.showNothingToShow();

        let $list = this.getList();
        for (let i in this.dataObject.episodes) {
            try {
            let episode = this.dataObject.get(i);
            if(!checkDateIsInTheLastWeek(episode))
                this.dataObject.removeByEpisodeUrl(episode.episodeUrl);
            else if(i < this.bufferSize)
                $list.append(this.getNewItemList(this.dataObject.get(i)));
            } catch(err) {
                console.log(err);
            }
        }
    }
    */

    showAll() {
        if(this.dataObject.isEmpty())
            this.showNothingToShow();

        let $list = this.getList();
        let epShownCounter = 0;
        for (let i in this.dataObject.episodes) {
            let episode = this.dataObject.get(i);
            if(!checkDateIsInTheLastWeek(episode))
                this.dataObject.removeByEpisodeUrl(episode.episodeUrl);
            else if(epShownCounter < this.bufferSize) {
                $list.append(this.getNewItemList(episode));
                epShownCounter++;
            }
        }
        let length = this.length()

        this.firstEpisodeDisplayed = 0;
        this.lastEpisodeDisplayed = length - 1;
        
        this.appendShowMoreEpisodesButton();
        this.prependShowMoreEpisodesButton();

        setScrollPositionOnTop();
    }

    convertItemIntoInfoItemList(obj) {
        let $obj = $(obj);
        $obj.attr('info-mode', '');
        let $descriptionItem = $obj.find('.list-item-description');
        $obj.off('click');
        
        $obj.find('div').not(".list-item-description").css('display', 'none');
        $obj.css('grid-template-columns', '5em 1fr 5em 5em');
        $descriptionItem.before(
            '<span id="info-item-list" style="opacity: 0;">' + 
                '<br>' +
                '<span style="font-size:16px;font-weight:bold;">' +
                    $obj.attr('title') +
                '</span>' +
                '<br>' +
                '<span style="font-size:13px;">' +
                    $obj.attr('channel') +
                '</span>' +
                '<br>' +
                '<span style="font-size:13px;opacity:0.7;">' +
                    $obj.find('.list-item-sub-text').html() +
                '</span>' +
                '<br>' +
                '<span style="font-size:15px;">' +
                    getInfoFromDescription($obj.attr('description')) +
                '</span>' +
                '<br>' +
                '<span style="font-size:13px;opacity:0.7;">' +
                    new Date($obj.attr('pubdate')).toLocaleString() +
                '</span>' +
                '<br>' +
                '<br>' +
            '</span>'
        )
        
        $obj.find('#info-item-list')
            .stop()
            .animate({opacity: 1.0}, 500)
        
        $descriptionItem.html(s_ArrowUpIcon);
        
        let initialHeight = $obj.css('height');
        $obj.css('height', 'auto');
        let autoHeight = $obj.css('height');
        $obj.css('height', initialHeight)
        
        $obj.find('img')
            .css('position', 'relative')
            .css('top', '0px')
            .stop()
            .animate({top: '22px'}, 300);

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
                playerManager.startsPlaying($(this).attr('feedUrl'), $(this).attr('url'));
            });
        
            $obj.find('div').removeAttr('style');
            $obj.css('grid-template-columns', '5em 1fr 6em 1fr 5em 5em');

            $obj.find('img')
                .stop()
                .animate({top: '0px'}, 300, function () {
                    $obj.find('img').removeAttr('style');
                });

            $obj
                .css('background-color', '')
                .css('height', height)
                .stop()
                .animate(
                    {height: '2.86em'}, // 2.7em => 37.7778px
                    300, 
                    function () {
                        $obj.css('height', '');
                    });
                

            $obj.find('#info-item-list').remove();
            
            $obj.find('.list-item-description')
                .html(s_InfoIcon);
        }
    }

    getNewItemList(newEpisode) {
        let episode = getInfoEpisodeByObj(newEpisode);

        let Artwork = getBestArtworkUrl(episode.feedUrl);
        let duration = getDurationFromDurationKey(episode);
        
        let ListElement = buildListItem(new cListElement (
            [
                getImagePart(Artwork),
                getBoldTextPart(episode.episodeTitle),
                getSubTextPart(duration),
                getTextPart(episode.channelName),
                getDescriptionPart(s_InfoIcon, episode.episodeDescription),
                getAddEpisodeButtonPart(allArchiveEpisodes.findByEpisodeUrl(episode.episodeUrl) != -1 ? 'remove' : 'add')
            ],
            "5em 1fr 6em 1fr 5em 5em"
        ), eLayout.row)

        $(ListElement).click(function(e) {
            if($(e.target).is('svg') || $(e.target).is('path') || $(e.target).hasClass('list-item-icon')) {
                e.preventDefault();
                return;
            }
            playerManager.startsPlaying($(this).attr('feedUrl'), $(this).attr('url'));
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

        if (playerManager.isPlaying(episode.episodeUrl))
            ListElement.classList.add("select-episode")
        
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
}

class NewEpisodes {
    constructor() {
        this.load();
        this.ui = new NewEpisodesUI(this);
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

    getInfoByIndex(i) {
        let newEpisode = this.get(i);
        return getInfoEpisodeByObj(newEpisode);
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
        episode = {
            feedUrl: episode.feedUrl,
            episodeUrl: episode.episodeUrl
        }
        if(this.findByEpisodeUrl(episode.episodeUrl) == -1) {
            let i = 0;
            while(i < this.length() && compareEpisodeDates(this.episodes[i], episode) > 0)
                i++;
            this.episodes.splice(i, 0, episode);
            this.update();
            this.ui.add(episode, i);
            return episode;
        } 
        return null;
    }
    
    removeByEpisodeUrl(episodeUrl) {
        let i = this.findByEpisodeUrl(episodeUrl);
        if(i != -1) {
            this.episodes.splice(i, 1);
            this.update();
            this.ui.removeByEpisodeUrl(episodeUrl);
            return true;
        }
        return false;
    }

    removePodcastEpisodes(feedUrl) {
        for(let i = this.episodes.length - 1; i >= 0; i--) {
            if(this.episodes[i].feedUrl == feedUrl)  
                this.episodes.splice(i, 1);
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