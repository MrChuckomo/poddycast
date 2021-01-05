var allFavoritePodcasts = null;

class FavoritePodcastsUI {
    constructor() {
    }
    
    isFavoritesPage() {
        if(getHeader() == generateHtmlTitle('Favorites'))
            return true;
        return false;
    }

    isEmpty() {
        return !this.getAllItemsList().get(0);
    }

    getList() {
        return $('#list');
    }
    
    getAllItemsList() {
        return $('#list li');
    }

    getByFeedUrl(feedUrl) {
        return this.getList().find('.podcast-entry-header[feedurl="' + feedUrl + '"]').parent();
    }

    add() {
        setItemCounts();
    }

    showNothingToShowPage() {
        if(this.isFavoritesPage()) {
            setHeaderViewAction("");
            setNothingToShowBody(s_FavoritesNothingFoundIcon, 'favorites-nothing-to-show');
        }
    }

    removeByFeedUrl(feedUrl) {
        if(this.isFavoritesPage()) {
            let $podcast = this.getByFeedUrl(feedUrl);
            $podcast
                .animate({opacity: 0.0}, 150)
                .slideUp(150, () => { 
                    $podcast.remove(); 
                    
                    if(this.isEmpty())
                        this.showNothingToShowPage();
                });

        }
        setItemCounts();
    }
}

class FavoritePodcasts {
    constructor() {
        this.load();
        this.ui = new FavoritePodcastsUI();
    }

    load() {
        if (!fs.existsSync(getSaveFilePath()))
            fs.openSync(getSaveFilePath(), 'w');
        
        let fileContent = ifExistsReadFile(getSaveFilePath());
        this.podcasts = JSON.parse(fileContent == "" ? "[]": fileContent);
    }

    update() {
        fs.writeFileSync(getSaveFilePath(), JSON.stringify(this.podcasts, null, "\t"));
    }
    
    length() {
        return this.podcasts.length;
    }

    isEmpty() {
        return (this.length() == 0);
    }

    getAll() {
        return this.podcasts;
    }

    exists(feedUrl) {
        return Boolean(this.getByFeedUrl(feedUrl));
    }
    
    findByFeedUrl(feedUrl) {
        for(let i in this.podcasts)
            if(this.podcasts[i].feedUrl == feedUrl)
                return i;
        return -1;
    }

    getByFeedUrl(feedUrl) {
        let i = this.findByFeedUrl(feedUrl);
        return (i != -1 ? this.podcasts[i] : undefined);
    }

    setData(podcast) {
        let i = this.findByFeedUrl(podcast.feedUrl);
        if(i != -1) {
            let oldArtwork = this.podcasts[i].data.artworkUrl;
            this.podcasts[i].data = {...podcast.data};
            this.podcasts[i].data.artworkUrl = oldArtwork;
            this.update();
            return true;
        }
        return false;
    }

    add(podcast) {
        let p = Object.assign(new Podcast, podcast);
        if(p.isValid() && this.findByFeedUrl(podcast.feedUrl) == -1) {
            let i = 0;
            while(i < this.podcasts.length && podcast.data.collectionName.localeCompare(this.podcasts[i].data.collectionName) == 1)
                i++;
            this.podcasts.splice(i, 0, podcast);
            this.update();
            this.ui.add();

            let feed = null;
            if(allFeeds.ui.checkPageByFeedUrl(podcast.feedUrl) && (feed = allFeeds.ui.getData())) {
                allFeeds.initFeed(podcast.feedUrl); 
                allFeeds.set(feed);
                addEpisodesFromTheLastWeek(podcast.feedUrl, feed);
            } else
                readFeedByFeedUrl(podcast.feedUrl);
            return podcast;
        }
        return null;
    }
    
    removeByFeedUrl(feedUrl) {
        let i = this.findByFeedUrl(feedUrl);
        if(i != -1) {
            this.podcasts.splice(i, 1);
            this.update();
            allNewEpisodes.removePodcastEpisodes(feedUrl);
            //allArchiveEpisodes.removePodcastEpisodes(feedUrl);
            allPlaylist.memory.removePodcastByFeedUrlFromAllPlaylists(feedUrl);
            allFeeds.delete(feedUrl);

            this.ui.removeByFeedUrl(feedUrl);
                
            return true;
        }
        return false;
    }

    setExcludeFromNewEpisodesByFeedUrl(feedUrl, value) {
        let i = this.findByFeedUrl(feedUrl);
        if(i != -1) {
            this.podcasts[i].excludeFromNewEpisodes = value;
            this.update();
            return true;
        }
        return false;
    }

    getExcludeFromNewEpisodesByFeedUrl(feedUrl) {
        let i = this.findByFeedUrl(feedUrl);
        if(i != -1) 
            return Boolean(this.podcasts[i].excludeFromNewEpisodes);
        return true;
    }
} 

function loadFavoritePodcasts() {
    allFavoritePodcasts = new FavoritePodcasts();
}


function setFavorite(_Self, _ArtistName, _CollectioName, _Artwork, _FeedUrl, description) {
    let podcast = new Podcast(
        _ArtistName,
        _CollectioName, 
        _Artwork, 
        _FeedUrl,
        description
    );

    let $podcastRow = $(_Self).parent().parent();
    $(_Self).parent().remove();
    $podcastRow.append(getFullHeartButton(podcast));
    console.log(podcast)
    allFavoritePodcasts.add(podcast);

}

function unsetFavorite(_Self, _ArtistName, _CollectioName, _Artwork, _FeedUrl, description) {
    let podcast = new Podcast(
        _ArtistName,
        _CollectioName, 
        _Artwork,
        _FeedUrl,
        description
    );

    allFavoritePodcasts.removeByFeedUrl(_FeedUrl);

    let $podcastRow = $(_Self).parent().parent();
    $(_Self).parent().remove();
    $podcastRow.append(getHeartButton(podcast));
}