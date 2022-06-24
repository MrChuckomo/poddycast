'use strict';

const { dialog, BrowserWindow } = require('electron');
const fs = require('fs');
const request = require('./request');
const setFavorite = require('./favorite').setFavorite;
const global = require('./helper/helper_global');

module.exports = {
    import: () => {
        let filePath = dialog.showOpenDialogSync(BrowserWindow, {
            properties: ['openFile'],
            filters: [{ name: 'OPML', extensions: ['opml'] }]
        })[0];

        if (filePath === undefined) {
            return;
        }

        let data = fs.readFileSync(filePath, { encoding: 'utf-8', flag: 'r' });

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, 'text/xml');

        let promises = [];
        Array.from(xmlDoc.getElementsByTagName('outline')).forEach((element) => {
            let feedUrl = element.getAttribute('xmlUrl');

            if (feedUrl) {
                promises.push(request.requestPodcastFeed(feedUrl));
            }
        });

        Promise.allSettled(promises).then(results => {
            let artist = '';
            let collection = '';
            let artwork = '';
            let url = '';
            results.forEach(result => {
                if (result.status === 'fulfilled') {
                    let podcast = result.value;
                    artist = podcast.items[0].itunes_author || podcast.title;
                    collection = podcast.title;
                    artwork = podcast.image;
                    url = podcast.link;
                    if (url) {
                        setFavorite(null, artist, collection, artwork, artwork, artwork, url);
                    }
                } else if (result.status === 'rejected') {
                    console.error(`Failed to add ${result.reason.config.link} due to response ${result.reason.response.status}: ${result.reason.response.statusText}`);
                }
            });


        });
    },

    export: () => {
        let filePath = dialog.showSaveDialogSync(BrowserWindow, {
            filters: [{ name: 'OPML', extensions: ['opml'] }]
        });

        if (filePath === undefined) {
            return;
        }

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
