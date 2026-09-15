'use strict';

const { brokenLinkIcon, favorite } = require('../interface/icons');
const data = require('../helper/data_handler');

class Podcast {
    constructor(jsonObject) {
        // JSON data
        this.collectionName = jsonObject.collectionName;
        this.artist = jsonObject.artist;
        this.artworkUrl30 = jsonObject.artworkUrl30;
        this.artworkUrl60 = jsonObject.artworkUrl60;
        this.artworkUrl100 = jsonObject.artworkUrl100;
        this.feedUrl = jsonObject.feedUrl;
        this.addToInbox = jsonObject.addToInbox;
        this.feedUrlStatus = jsonObject.feedUrlStatus;

        // internal use data
        this.newEpisodes = [];
        this.favoriteElement = null;
        this.feedStatusElement = null;
    }

    loadNewEpisodes() {
        if (!this.addToInbox) {
            return;
        }
        const storedRecentDate = global.getFeedRecentEpisodeDate(content.link);
        request.requestPodcastFeed(podcast.feedUrl, false)
            .then((content) => {
                const latestDate = content.items[0].published;
            
                for (let i = 0; i < content.items.length; i++) {
                    const item = content.items[i];
                    if (storedRecentDate === null || item.published > storedRecentDate) {
                        this.addNewEpisode(item);
                        // only process one episode if we don't have a previous one stored
                        if (storedRecentDate === null) {
                            break;
                        }
                    } else {
                        break;
                    }
                }
                global.addRecentEpisode(content.link, latestDate);
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                if (this.newEpisodes.length !== 0) {
                    this.data.saveNewEpisodes(this.newEpisodes);
                }
            });
    }

    addNewEpisode(episodeData) {
        this.newEpisodes.push(new Episode(
            this.collectionName,
            episodeData.title,
            episodeData.description,
            episodeData.duration,
            episodeData.type,
            episodeData.link,
            episodeData.itunes_image,
            episodeData.duration_formatted
        ));
    }

    getFavoriteElement() {
        const li = document.createElement('li');
        this.favoriteElement = li;
        li.className = 'podcast-entry';
        li.draggable = true;

        const safeTitle = this.collectionName || '';
        const safeImage = this.artworkUrl100 || '';
        const safeFeedUrl = this.feedUrl || '';

        li.innerHTML = `
            <div class="podcast-entry-header" feedurl="${safeFeedUrl}" onclick="window.navAPI.clickPodcast(this)">
                <img src="${safeImage}" draggable="false" />
                <div class="podcast-entry-title fw-normal">${safeTitle}</div>
                <div class="podcast-entry-tail"></div>
            </div>
            <div class="podcast-entry-actions">${favorite}</div>
            <div class="podcast-entry-body"></div>
        `;

        const outerDiv = li.querySelector('.podcast-entry-header');

        if (this.feedUrlStatus && this.feedUrlStatus >= 400) {
            const brokenLinkIconElement = document.createElement('span');
            brokenLinkIconElement.innerHTML = brokenLinkIcon;
            brokenLinkIconElement.classList.add('icon-link-broken-wrapper', 'alert', 'alert-danger');
            brokenLinkIconElement.setAttribute('title', 'Podcast feed URL is broken.');
            outerDiv.append(brokenLinkIconElement);
            outerDiv.classList.add('podcast-feed-url-broken');
        }

        this.feedStatusElement = outerDiv;
        // set drag data so folders can accept podcasts
        const dndHelper = require('../domain/drag_handler');
        li.addEventListener('dragstart', (ev) => {
            dndHelper.setDragData(ev, safeFeedUrl, 'text/plain', 'move');
        });

        return li;
    }

    toJson() {
        return {
            artistName: this.artist,
            collectionName: this.collectionName,
            artworkUrl30: this.artworkUrl30,
            artworkUrl60: this.artworkUrl60,
            artworkUrl100: this.artworkUrl100,
            feedUrl: this.feedUrl,
            addToInbox: this.addToInbox,
            feedUrlStatus: this.feedUrlStatus
        }
    }
}
module.exports.Podcast = Podcast;
