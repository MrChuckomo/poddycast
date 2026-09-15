'use strict';

const fs = require('fs');
const global = require('./helper_global');

function readSaveFile() {
    if (!global.fileExistsAndIsNotEmpty(global.saveFilePath)) return [];
    try {
        return JSON.parse(fs.readFileSync(global.saveFilePath, 'utf-8'));
    } catch (e) {
        return [];
    }
}

function writeSaveFile(structure) {
    fs.writeFileSync(global.saveFilePath, JSON.stringify(structure));
}

// Create a new folder with the given name.
function createFolder(folderName) {
    if (!folderName || folderName.trim() === '') return false;
    const saveContent = readSaveFile();
    saveContent.push({ folderName: folderName.trim(), items: [] });
    writeSaveFile(saveContent);
    return true;
}

// Recursively remove a podcast (by feedUrl) from the structure.
function findAndRemovePodcast(arr, feedUrl) {
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        if (item.feedUrl && item.feedUrl === feedUrl) {
            arr.splice(i, 1);
            return true;
        }
        if (item.items && Array.isArray(item.items)) {
            if (findAndRemovePodcast(item.items, feedUrl)) return true;
        }
    }
    return false;
}

// Add a podcast object to a folder (removing any existing copy first).
function addPodcastToFolder(feedUrl, folderName, podcastObject) {
    const saveContent = readSaveFile();

    function addTo(arr) {
        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            if (item.folderName && item.folderName === folderName) {
                item.items.push(podcastObject);
                return true;
            }
            if (item.items && Array.isArray(item.items)) {
                if (addTo(item.items)) return true;
            }
        }
        return false;
    }

    // remove existing instance anywhere then try to add into target folder
    findAndRemovePodcast(saveContent, feedUrl);
    const added = addTo(saveContent);
    if (added) writeSaveFile(saveContent);
    return added;
}

// Move an existing podcast (by feedUrl) into target folder.
function movePodcastToFolder(feedUrl, folderName) {
    const saveContent = readSaveFile();
    let podcastObject = null;

    // search and extract podcast object recursively
    function extract(arr) {
        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            if (item.feedUrl && item.feedUrl === feedUrl) {
                podcastObject = item;
                arr.splice(i, 1);
                return true;
            }
            if (item.items && Array.isArray(item.items)) {
                if (extract(item.items)) return true;
            }
        }
        return false;
    }

    extract(saveContent);

    if (!podcastObject) return false;

    // add to target folder (recursive search)
    function addTo(arr) {
        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            if (item.folderName && item.folderName === folderName) {
                item.items.push(podcastObject);
                return true;
            }
            if (item.items && Array.isArray(item.items)) {
                if (addTo(item.items)) return true;
            }
        }
        return false;
    }

    const added = addTo(saveContent);
    if (added) writeSaveFile(saveContent);
    return added;
}

// Extract a podcast from anywhere and append it to the top-level array.
function movePodcastToRoot(feedUrl) {
    const saveContent = readSaveFile();
    let podcastObject = null;

    // search and extract podcast object recursively
    function extract(arr) {
        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            if (item.feedUrl && item.feedUrl === feedUrl) {
                podcastObject = item;
                arr.splice(i, 1);
                return true;
            }
            if (item.items && Array.isArray(item.items)) {
                if (extract(item.items)) return true;
            }
        }
        return false;
    }

    extract(saveContent);

    if (!podcastObject) return false;

    // add to top-level
    saveContent.push(podcastObject);
    writeSaveFile(saveContent);
    return true;
}

function deleteFolder(folderName) {
    if (!folderName) return false;
    const saveContent = readSaveFile();
    function remove(arr) {
        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            if (item.folderName && item.folderName === folderName) {
                arr.splice(i, 1);
                return true;
            }
            if (item.items && Array.isArray(item.items)) {
                if (remove(item.items)) return true;
            }
        }
        return false;
    }
    const removed = remove(saveContent);
    if (removed) writeSaveFile(saveContent);
    return removed;
}

function renameFolder(oldName, newName) {
    if (!oldName || !newName) return false;
    const saveContent = readSaveFile();
    function rename(arr) {
        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            if (item.folderName && item.folderName === oldName) {
                item.folderName = newName;
                return true;
            }
            if (item.items && Array.isArray(item.items)) {
                if (rename(item.items)) return true;
            }
        }
        return false;
    }
    const renamed = rename(saveContent);
    if (renamed) writeSaveFile(saveContent);
    return renamed;
}

module.exports = {
    readSaveFile,
    createFolder,
    deleteFolder,
    renameFolder,
    movePodcastToFolder,
    addPodcastToFolder,
    movePodcastToRoot
};
