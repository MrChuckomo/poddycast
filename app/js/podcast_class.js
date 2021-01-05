class Podcast {
    constructor(artistName, collectionName, artworkUrl, feedUrl, description) {
        this.feedUrl = feedUrl;
        
        this.data = {
            artistName: artistName,
            collectionName: collectionName,
            artworkUrl: artworkUrl,
            description: (description ? description : '')
        };

        this.excludeFromNewEpisodes = false;
    }

    isValid() {
        return (this.data.collectionName && this.feedUrl);
    }
}