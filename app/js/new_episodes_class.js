var CPlayer = require('./js/helper/player')
var player = new CPlayer()

var allNewEpisodes = null;

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

    getByEpisodeUrl(episodeUrl) {
        return this.getAllItemsList().filter('[url="' + episodeUrl + '"]');
    }

    add(i) {
        setItemCounts();
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

    removeByEpisodeUrl(episodeUrl) {
        setItemCounts();
        if(this.getPageType()) {
            let $episodeItem = this.getByEpisodeUrl(episodeUrl);
            
            $episodeItem
                .animate({opacity: 0.0}, 150)
                .slideUp(150, () => { 
                    $episodeItem.remove(); 

                    this.updateAfterDelete();
                });
        }
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
                    //$descriptionItem.attr('title') +
                    getEpisodeInfoFromDescription($descriptionItem.attr('description')) +
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
                playNow(this);
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
                    {height: '2.7em'}, // 37.7778px
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
        
        $(ListElement).click(function(e) {
            if($(e.target).is('svg') || $(e.target).is('path') || $(e.target).hasClass('list-item-icon')) {
                e.preventDefault();
                return;
            }
            playNow(this);
        });
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