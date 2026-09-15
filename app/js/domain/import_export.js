'use strict';

// const { dialog, BrowserWindow } = require('electron');
const fs = require('fs');
const nav = require('./nav');
const request = require('./request');
const global = require('../helper/helper_global');
const setFavorite = require('../helper/favorite').setFavorite;
const favoritesManager = require('../helper/favorites_manager');

module.exports = {
    import: (filePath) => {
        let data = fs.readFileSync(filePath, {encoding: 'utf-8', flag: 'r'});
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, 'text/xml');
        const body = xmlDoc.getElementsByTagName('body')[0];
        const tasks = [];

        body.childNodes.forEach((element) => {
            if (element.nodeName !== 'outline') return;

            const feedUrl = element.getAttribute('xmlUrl');

            // Simple outline with xmlUrl -> top-level favorite
            if (feedUrl) {
                // if feed already saved, skip fetching and log
                if (global.isAlreadySaved(feedUrl)) {
                    console.log('[OPML] import: feed already saved, skipping:', feedUrl);
                } else {
                    request.requestPodcastFeed(feedUrl).then(result => {
                        const podcast = result;
                        const artist = (podcast.items && podcast.items[0] && podcast.items[0].author) === undefined ? podcast.title : podcast.items[0].author;
                        const collection = podcast.title || '';
                        const artwork = podcast.image || '';
                        const url = feedUrl;
                        if (url) {
                            setFavorite(null, artist, collection, artwork, artwork, artwork, url);
                        }
                    }).catch(err => console.error('[OPML] import feed error for', feedUrl, err));
                }
                return;
            }

            // Outline without xmlUrl may represent a folder containing child outlines
            const folderName = element.getAttribute('text') || element.getAttribute('title') || 'Folder';
            // create folder synchronously
            favoritesManager.createFolder(folderName);

            // collect child outline feeds and add them to the newly created folder
            element.childNodes.forEach((child) => {
                if (child.nodeName !== 'outline') return;
                const childFeed = child.getAttribute('xmlUrl');
                if (!childFeed) return;
                // If feed already exists, move it into the folder and log; otherwise fetch and add
                if (global.isAlreadySaved(childFeed)) {
                    console.log('[OPML] import: feed already saved, moving into folder', folderName, childFeed);
                    try {
                        const moved = favoritesManager.movePodcastToFolder(childFeed, folderName);
                        if (!moved) {
                            // fallback: attempt to fetch and add
                            console.log('[OPML] import: move to folder failed, fetching to add instead:', childFeed);
                        }
                    } catch (ex) {
                        console.error('[OPML] import: error moving existing feed to folder', childFeed, ex);
                    }
                }

                const p = request.requestPodcastFeed(childFeed).then(result => {
                    const podcast = result;
                    const artist = (podcast.items && podcast.items[0] && podcast.items[0].author) === undefined ? podcast.title : podcast.items[0].author;
                    const collection = podcast.title || '';
                    const artwork = podcast.image || '';
                    const feedObj = {
                        'artistName': global.sanitizeString(artist),
                        'collectionName': global.sanitizeString(collection),
                        'artworkUrl30': global.sanitizeString(artwork),
                        'artworkUrl60': global.sanitizeString(artwork),
                        'artworkUrl100': global.sanitizeString(artwork),
                        'feedUrl': childFeed,
                        'addToInbox': true,
                        'feedUrlStatus': 200
                    };
                    // If not already saved, add; if already saved, addPodcastToFolder will remove existing then add (keeps single copy)
                    favoritesManager.addPodcastToFolder(childFeed, folderName, feedObj);
                }).catch(err => console.error('[OPML] import child feed error for', childFeed, err));

                tasks.push(p);
            });
        });

        // When all async adds finish, show favorites
        Promise.allSettled(tasks).then(() => {
            nav.selectMenuItem('menu-favorites');
            nav.showFavorites();
        });
    },

    export: (filePath) => {
        const JsonContent = JSON.parse(fs.readFileSync(global.saveFilePath, 'utf-8'));

        let rootString = '<opml version="1.0"></opml>';
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(rootString, 'text/xml');
        let root = xmlDoc.getElementsByTagName('opml')[0];
        let head = xmlDoc.createElement('head');
        root.appendChild(head);
        let title = xmlDoc.createElement('title');
        title.innerHTML = 'Poddycast Export';
        let dateCreated = xmlDoc.createElement('dateCreated');
        dateCreated.innerHTML = (new Date(Date.now())).toUTCString();
        let dateModified = xmlDoc.createElement('dateModified');
        dateModified.innerHTML = (new Date(Date.now())).toUTCString();
        head.appendChild(title);
        head.appendChild(dateCreated);
        head.appendChild(dateModified);
        let body = xmlDoc.createElement('body');
        root.appendChild(body);

        JsonContent.forEach(element => {
            let type = xmlDoc.createAttribute('type');
            type.nodeValue = 'rss';
            let text = xmlDoc.createAttribute('text');
            let title = xmlDoc.createAttribute('title');
            let xmlUrl = xmlDoc.createAttribute('xmlUrl');
            let outline = xmlDoc.createElement('outline');
            text.nodeValue = element.collectionName;
            title.nodeValue = element.collectionName;
            xmlUrl.nodeValue = element.feedUrl;
            outline.setAttributeNode(type);
            outline.setAttributeNode(text);
            outline.setAttributeNode(title);
            outline.setAttributeNode(xmlUrl);
            body.appendChild(outline);
        });

        let serializer = new XMLSerializer();
        let xmlString = serializer.serializeToString(xmlDoc);
        fs.writeFileSync(filePath, xmlString);
        fs.close();
    }
};
