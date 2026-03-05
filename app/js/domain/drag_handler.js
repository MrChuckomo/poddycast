"use strict";

const navigation = require('../helper/helper_navigation');
const global = require('../helper/helper_global');
const { Podcast } = require('../classes/podcast');

function handleDragStart(dragEvent) {
    const img = this.querySelector && this.querySelector('img');
    try {
        dragEvent.dataTransfer.setDragImage(img, -10, -10);
    } catch (err) {
        console.error('drag_handler.handleDragStart: setDragImage failed', err);
    }

    this.classList.remove('over');
}

function handleDragEnter() {
    this.classList.add('over');
}

function handleDragLeave() {
    this.classList.remove('over');
}

function handleDragOver(dragEvent) {
    if (dragEvent.preventDefault) dragEvent.preventDefault();
    setMoveEffect(dragEvent);
    return false;
}

function handleDrop(dragEvent) {
    this.classList.remove('over');
    const feedUrl = safeReadDataTransfer(dragEvent);
    if (!feedUrl) return;

    // Map feedUrl to display podcast name stored in save file
    const podcastName = global.getValueFromFile(global.saveFilePath, 'collectionName', 'feedUrl', feedUrl) || '';
    const playlistName = this.getElementsByTagName('input')[0].value;

    navigation.dragToPlaylist(playlistName, podcastName);
}

// Safely read from event.dataTransfer. Returns null on failure.
function safeReadDataTransfer(ev, key = 'text/plain') {
    try {
        return ev.dataTransfer.getData(key);
    } catch (err) {
        console.error('safeReadDataTransfer failed:', err);
        return null;
    }
}

// Ensure dropEffect is set to 'move' where supported.
function setMoveEffect(ev) {
    try {
        if (ev && ev.dataTransfer) ev.dataTransfer.dropEffect = 'move';
    } catch (err) {
        console.error('setMoveEffect failed:', err);
    }
}

// Set drag key and payload on dragstart
function setDragData(ev, payload, key = 'text/plain', effect = 'move') {
    try {
        if (!ev || !ev.dataTransfer) return false;
        if (payload !== undefined && payload !== null) ev.dataTransfer.setData(key, payload);
        ev.dataTransfer.effectAllowed = effect;
        return true;
    } catch (err) {
        console.error('setDragData failed:', err);
        return false;
    }
}

// Locate a podcast entry by feedUrl and move it to targetList.
function movePodcastToList(feedUrl, targetList) {
    try {
        if (!feedUrl || !targetList) return null;
        const headerElement = document.querySelector('.podcast-entry-header[feedurl="' + feedUrl + '"]');
        if (!headerElement) return null;
        const liEl = headerElement.closest('li');
        const imgEl = headerElement.querySelector('img');
        const titleEl = headerElement.querySelector('.podcast-entry-title');
        const obj = {
            collectionName: titleEl ? titleEl.innerText : '',
            artworkUrl100: imgEl ? imgEl.src : '',
            feedUrl: feedUrl
        };
        if (liEl && liEl.parentElement) liEl.parentElement.removeChild(liEl);
        const podcast = new Podcast(obj);
        targetList.appendChild(podcast.getFavoriteElement());
        return obj;
    } catch (err) {
        console.error('movePodcastToList failed:', err);
        return null;
    }
}

module.exports = {
    handleDragStart,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    safeReadDataTransfer,
    setMoveEffect,
    setDragData,
    movePodcastToList
};
