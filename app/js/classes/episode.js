'use strict';

class Episode {
    constructor(channelName, title, description, length, type, url, episodeImage, duration) {
        this.channelName = channelName;
        this.title = title;
        this.description = description;
        this.length = length;
        this.type = type;
        this.url = url;
        this.image = episodeImage;
        this.duration = duration;
        this.playbackPosition = 0;
    }

    getNewEpisodeElement() {
        const li = document.createElement('li');
        li.className = 'podcast-entry';
        li.draggable = true;

        const safeTitle = this.title ? this.title : '';
        const safeImage = this.image ? this.image : '';
        const safeUrl = this.url ? this.url : '';

        li.innerHTML = `
            <div class="podcast-entry-header podcast-feed-url-working" feedurl="${safeUrl}" onclick="window.navAPI.clickPodcast(this)">
                <img src="${safeImage}" draggable="false" />
                <div class="podcast-entry-title fw-normal">${safeTitle}</div>
                <div class="podcast-entry-tail"></div>
            </div>
            <div class="podcast-entry-actions">
                <svg class="set-favorite" onclick="window.navAPI.unsubscribePodcast(this)" fill="#000000" height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0h24v24H0z" fill="none"/>
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
            </div>
            <div class="podcast-entry-body"></div>
        `;

        return li;
    }

    toJSON() {
        return {
            'channelName': this.channelName,
            'episodeTitle': this.title,
            'episodeDescription': this.description,
            'episodeLength': this.length,
            'episodeType': this.type,
            'episodeUrl': this.url,
            'episodeImage': this.image,
            'duration': this.duration,
            'playbackPosition': this.playbackPosition
        };
    }
}
module.exports.Episode = Episode;
