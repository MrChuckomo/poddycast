var allFavoritePodcasts = null;

class Podcast {
    constructor(artistName, collectionName, artworkUrl30, artworkUrl60, artworkUrl100, feedUrl) {
        this.artistName = artistName;
        this.collectionName = collectionName;
        this.artworkUrl30 = artworkUrl30;
        this.artworkUrl60 = artworkUrl60;
        this.artworkUrl100 = artworkUrl100;
        this.feedUrl = feedUrl;
        this.excludeFromNewEpisodes = false;
    }

    isValid() {
        return (this.artistName && this.collectionName && this.feedUrl);
    }
}

class FavoritePodcasts {
    constructor() {
        this.load();
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
/*
    findByName(name) {
        for(let i in this.podcasts)
            if(this.podcasts[i].collectionName == name)
                return i;
        return -1;
    }

    getByName(name) {
        let i = this.findByName(name);
        return (i != -1 ? this.podcasts[i] : undefined);
    }

    findByNameAndArtist(name, artist) {
        for(let i in this.podcasts)
            if(this.podcasts[i].collectionName == name && this.podcasts[i].artistName == artist)
                return i;
        return -1;
    }

    getByNameAndArtist(name, artist) {
        let i = this.findByNameAndArtist(name, artist);
        return (i != -1 ? this.podcasts[i] : undefined);
    }
*/
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

    add(podcast) {
        let p = Object.assign(new Podcast, podcast);
        if(p.isValid() && this.findByFeedUrl(podcast.feedUrl) == -1) {
            let i = 0;
            while(i < this.podcasts.length && podcast.collectionName.localeCompare(this.podcasts[i].collectionName) == 1)
                i++;
            this.podcasts.splice(i, 0, podcast);
            this.update();
            setItemCounts();
            readFeeds();
            return podcast;
        }
        return null;
    }
/*
    removeByName(name) {
        let i = this.findByName(name);
        if(i != -1) {
            this.podcasts.splice(i, 1);
            this.update();
            allNewEpisodes.removePodcastEpisodes(name);
            allPlaylist.memory.removePodcastByNameFromAllPlaylists(name);
            allFeeds.delete(name);
            return true;
        }
        return false;
    }

    removeByNameAndArtist(name, artist) {
        let i = this.findByNameAndArtist(name, artist);
        if(i != -1) {
            this.podcasts.splice(i, 1);
            this.update();
            allNewEpisodes.removePodcastEpisodes(name);
            allPlaylist.memory.removePodcastByNameFromAllPlaylists(name);
            allFeeds.delete(name);
            return true;
        }
        return false;
    }
*/
    removeByFeedUrl(feedUrl) {
        let i = this.findByFeedUrl(feedUrl);
        if(i != -1) {
            this.podcasts.splice(i, 1);
            this.update();
            allNewEpisodes.removePodcastEpisodes(feedUrl);
            allPlaylist.memory.removePodcastByFeedUrlFromAllPlaylists(feedUrl);
            allFeeds.delete(feedUrl);
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


function setFavorite(_Self, _ArtistName, _CollectioName, _Artwork30, _Artwork60, _Artwork100, _FeedUrl) {
    let podcast = new Podcast(
        _ArtistName,
        _CollectioName, 
        _Artwork30, 
        _Artwork60, 
        _Artwork100, 
        _FeedUrl
    );

    let $podcastRow = $(_Self).parent().parent();
    console.log($podcastRow.get(0))
    $(_Self).parent().remove();
    $podcastRow.append(getFullHeartButton(podcast));


    allFavoritePodcasts.add(podcast);

    //addToSettings(_CollectioName, _FeedUrl)

}

function unsetFavorite(_Self, _ArtistName, _CollectioName, _Artwork30, _Artwork60, _Artwork100, _FeedUrl) {
    let podcast = new Podcast(
        _ArtistName,
        _CollectioName, 
        _Artwork30, 
        _Artwork60, 
        _Artwork100, 
        _FeedUrl
    );

    allFavoritePodcasts.removeByFeedUrl(_FeedUrl);

    let $podcastRow = $(_Self).parent().parent();
    $(_Self).parent().remove();
    $podcastRow.append(getHeartButton(podcast));
    
    setItemCounts();
}