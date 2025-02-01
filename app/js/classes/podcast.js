'use strict';

const { brokenLinkIcon, favorite } = require('../interface/icons');

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

    getFavoriteElement() {
        let baseList = document.createElement('li');
        this.favoriteElement = baseList;
        // HTML setup
        baseList.classList.add('podcast-entry');
        baseList.draggable = true;

        let outerDiv = document.createElement('div');
        outerDiv.classList.add('podcast-entry-header');
        outerDiv.setAttribute('feedurl', this.feedUrl);
        outerDiv.setAttribute('onclick', 'window.navAPI.clickPodcast(this)');
        baseList.appendChild(outerDiv);

        let image = document.createElement('img');
        image.src = this.artworkUrl100;
        image.draggable = false;
        outerDiv.appendChild(image);

        let titleDiv = document.createElement('div');
        titleDiv.classList.add('podcast-entry-title', 'fw-normal');
        titleDiv.innerHTML = this.collectionName;
        outerDiv.appendChild(titleDiv);

        let tailDiv = document.createElement('div');
        tailDiv.classList.add('podcast-entry-tail');
        outerDiv.appendChild(tailDiv);

        let actionDiv = document.createElement('div');
        actionDiv.classList.add('podcast-entry-actions');
        actionDiv.innerHTML = favorite;
        baseList.appendChild(actionDiv);

        let bodyDiv = document.createElement('div');
        bodyDiv.classList.add('podcast-entry-body');
        baseList.appendChild(bodyDiv);
        

        if (this.feedUrlStatus && this.feedUrlStatus >= 400) {
            // Display feedUrlStatus indicator
            let brokenLinkIconElement = document.createElement('span');
            brokenLinkIconElement.innerHTML = brokenLinkIcon;
            brokenLinkIconElement.classList.add('icon-link-broken-wrapper', 'alert', 'alert-danger');
            brokenLinkIconElement.setAttribute('title', 'Podcast feed URL is broken.');
            outerDiv.append(brokenLinkIconElement);
            outerDiv.classList.add('podcast-feed-url-broken')
        }
        
        // store as a variable for easy use later
        this.feedStatusElement = outerDiv;

        return baseList;
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
