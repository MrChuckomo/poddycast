var allArchiveEpisodes = null;

class ArchiveEpisodesUI extends ListUI {
    isArchivePage() {
        return (this.getPageType() == 'archive');
    }

    showNothingToShow() {
        if(this.isArchivePage()) 
            super.showNothingToShow(s_ArchiveNothingFoundIcon, 'archive-nothing-to-show');
    }

    add(episode, i) {
        setItemCounts();
        if(this.isArchivePage()) {
            super.add(episode, i);
        }
    }

    removeByEpisodeUrl(episodeUrl) {
        setItemCounts();
        if(this.isArchivePage()) {
            super.removeByEpisodeUrl(episodeUrl, this.dataObject.episodes);
        }
    }

    showAll() {
        this.showList(this.dataObject.episodes);
        this.dataObject.update();
    }

    getShowMoreEpisodesTopHtml() {
        return $(super.getShowMoreEpisodesTopHtml()).addClass('border-top');
    }

    convertItemIntoInfoItemList(obj) {
        let episode = _(obj);

        let $obj = $(obj);
        $obj.attr('info-mode', '');
        let $descriptionItem = $obj.find('.list-item-description');
        $obj.off('click');
        
        $obj.find('div').not(".list-item-description").css('display', 'none');
        $obj.css('grid-template-columns', '5em 1fr 5em 5em');
        $descriptionItem.before(
            `<span id="info-item-list" style="opacity: 0;">
                <br>
                <span class="info-title">
                    ${episode.episodeTitle}
                </span>
                <br>
                <span class="info-channel">
                    ${episode.channelName}
                </span>
                <br>
                <span class="info-duration">
                    ${getDurationFromDurationKey({durationKey: episode.durationKey})}
                </span>
                <br>
                <span class="info-description">
                    ${getInfoFromDescription(episode.episodeDescription)}
                </span>
                <br>
                <span class="info-pubdate">
                    ${new Date(episode.pubDate).toLocaleString()}
                </span>
                <br>
                <br>
            </span>`
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
                playerManager.startsPlaying(_(this));
            });
        
            $obj.find('div')
                .not('.list-item-flag')
                .removeAttr('style');

            $obj.css('grid-template-columns', "5em 1fr 1fr 6em 5em 5em");

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
            
            $obj.find('.list-item-flag')
                .css('display', '');
        }
    }

    getNewItemList(archiveEpisode) {
        //let episode = getInfoEpisodeByObj(archiveEpisode);
        let episode = getEpisodeFromArchiveEpisode(archiveEpisode);

        let Artwork = episode.artwork; //getBestArtworkUrl(episode.feedUrl);
        
        let ListElement = buildListItem(new cListElement (
            [
                getImagePart(Artwork),
                getBoldTextPart(episode.episodeTitle),
                getTextPart(episode.channelName),
                getProgressionFlagPart(episode.episodeUrl),// getFlagPart('Done', 'white', '#4CAF50'),
                getDescriptionPart(s_InfoIcon, episode.episodeDescription),
                getDeleteButtonPart()
            ],
            "5em 1fr 1fr 6em 5em 5em"
        ), eLayout.row)

        // if (!allFeeds.getPlaybackDoneByEpisodeUrl(episode.episodeUrl))
        //    $(ListElement).find('.list-item-flag').css('opacity', 0);//ListElement.replaceChild(getIconButtonPart(''), ListElement.children[3]);
        
        $(ListElement).click(function(e) {
            if($(e.target).is('svg') || $(e.target).is('path') || $(e.target).hasClass('list-item-icon') || $(e.target).hasClass('list-item-text')) {
                e.preventDefault();
                return;
            }
            playerManager.startsPlaying(_(this));
        });

        $(ListElement).data(episode);
        $(ListElement).attr('url', episode.episodeUrl);

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

class ArchiveEpisodes {
    constructor() {
        this.load();
        this.ui = new ArchiveEpisodesUI(this);
    }

    load() {
        if (!fs.existsSync(getArchivedFilePath()))
            fs.openSync(getArchivedFilePath(), 'w');
            
        let fileContent = ifExistsReadFile(getArchivedFilePath());
        this.episodes = JSON.parse(fileContent == "" ? "[]": fileContent);
    }

    update() {
        fs.writeFileSync(getArchivedFilePath(), JSON.stringify(this.episodes, null, "\t"));
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
        let archiveEpisode = this.get(i);
        return getInfoEpisodeByObj(archiveEpisode);
    }
    
    findByEpisodeUrl(episodeUrl) {
        return this.episodes.map(e => e.episodeUrl).indexOf(episodeUrl);
    }

    getByEpisodeUrl(episodeUrl) {
        let i = this.findByEpisodeUrl(episodeUrl);
        return (i != -1 ? this.episodes[i] : undefined);
    }

    setByEpisode(episode) {
        let i = this.findByEpisodeUrl(episode.episodeUrl);
        if(i != -1) 
            this.episodes[i] = episode;
        return i;
    }
    
    add(episode) {
        if(this.findByEpisodeUrl(episode.episodeUrl) == -1) {
            this.episodes.unshift(episode);
            this.update();
            this.ui.add(episode, 0);
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

}

function loadArchiveEpisodes() {
    allArchiveEpisodes = new ArchiveEpisodes();
}

function getPodcastFromEpisode(episode) {
    let podcast = allFavoritePodcasts.getByFeedUrl(episode.feedUrl);
    if(podcast)
        return podcast;
    else 
        return new Podcast(
            '',
            episode.channelName,
            episode.artwork,
            episode.feedUrl,
            ''
        );
}

function getEpisodeFromArchiveEpisode(archiveEpisode) {
    let episode = getInfoEpisodeByObj(archiveEpisode);
    if(episode) {
        allArchiveEpisodes.setByEpisode(episode);
        return episode;
    } else 
        return archiveEpisode;
}