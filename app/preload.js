'use strict';

const { ipcRenderer, contextBridge } = require('electron');
const feed = require('./js/feed');
const opml = require('./js/import_export');
const search = require('./js/search');
const global = require('./js/helper/helper_global');
const navigation = require('./js/helper/helper_navigation');
const entries = require('./js/helper/helper_entries');
const audioPlayer = require('./js/player');
const playlist = require('./js/playlist');
const favorite = require('./js/favorite');
const darkMode = require('./js/dark_mode');
const nav = require('./js/nav');

window.addEventListener('DOMContentLoaded', () => {
    global.init();
    audioPlayer.init();
    playlist.loadPlaylists();
    nav.showNewEpisodes();
    navigation.setItemCounts();
    nav.initLocalization();
    feed.readFeeds().then(() => {
        nav.selectMenuItem('menu-episodes');
        nav.showNewEpisodes();
        navigation.setItemCounts();
    });
});


/**
 * Menu trigger from main to renderer process
 */
contextBridge.exposeInMainWorld('electronAPI', {
    onTriggerMenu: (callback) => ipcRenderer.on('trigger-menu', (callback))
});


/**
 * IPCs to handle actions on the left side navigation
 */
contextBridge.exposeInMainWorld('navAPI', {
    clickSearch: () => global.focusTextField('search-input'),
    searchInput: (value, key) => search.search(value, key),
    newListInput: (value, key) => playlist.createPlaylist(value, key),
    newListButtonInput: () => playlist.onPlaylistButtonClicked(),
    clickEpisodes: () => {
        nav.selectMenuItem('menu-episodes');
        nav.showNewEpisodes();
    },
    clickFavorites: () => {
        nav.selectMenuItem('menu-favorites');
        nav.showFavorites();
    },
    clickPodcast: (element) => feed.showAllEpisodes(element),
    clickHistory: () => {
        nav.selectMenuItem('menu-history');
        nav.showHistory();
    },
    clickStatistics: () => {
        nav.selectMenuItem('menu-statistics');
        nav.showStatistics();
    },
    clickRefresh: () => feed.readFeeds(),
    clickNewList: () => global.focusTextField('new_list-input'),
    loseFocus: (element) => navigation.clearRenameFocus(element),
    subscribePodcast: (self, artists, collection, artwork30, artwork60, artwork100, feedUrl) => {
        favorite.setFavorite(self, artists, collection, artwork30, artwork60, artwork100, feedUrl);
    },
    unsubscribePodcast: (self) => entries.unsubscribeListElement(self)
});


/**
 * IPCs for color scheme handling
 */
contextBridge.exposeInMainWorld('colorAPI', {
    system: () => darkMode.toggleDarkMode('systemmode'),
    light: () => darkMode.toggleDarkMode('lightmode'),
    dark: () => darkMode.toggleDarkMode('darkmode')
});


/**
 * IPCs to handle playlist actions
 */
contextBridge.exposeInMainWorld('playlistAPI', {
    clickItem: (self) => playlist.showPlaylistContent(self),
    dblclickItem: (self) => playlist.enableRename(self),
    rename: (element, key) => playlist.renamePlaylist(element, key),
    connectPodcast: (element) => playlist.togglePodcast(element),
    delete: (playlistName) => navigation.deletePlaylist(playlistName)
});

/**
 * Receive context-menu command back from main process
 * For the playlist.
 */
ipcRenderer.on('ctx-playlist-command', (e, cmd, targetId) => {
    let target = document.getElementById(targetId);
    switch (cmd) {
        case 'ctx-cmd-edit': playlist.showEditPage(target); break;
        case 'ctx-cmd-rename': playlist.enableRename(target); break;
        case 'ctx-cmd-delete': navigation.deletePlaylist(target); break;
        default: break;
    }
});

/**
 * Receive context-menu command back from main process
 * For the podcast settings.
 */
ipcRenderer.on('ctx-podcast-command', (e, cmd, podcastName, playlistName, feedUrl) => {
    switch (cmd) {
        case 'ctx-cmd-add':
            feed.addToPlaylist(podcastName, playlistName);
            playlist.showPlaylistContent(document.getElementById('playlist-' + playlistName.toLowerCase().replaceAll(' ', '-')));
            break;
        case 'ctx-cmd-push':
            global.setIsAddedToInbox(feedUrl, !global.isAddedToInbox(feedUrl));
            nav.selectMenuItem('menu-favorites');
            nav.showFavorites();
            break;
        case 'ctx-cmd-unsubscribe':
            if (podcastName !== null && podcastName !== undefined) {
                entries.unsubscribeContextMenu(podcastName, feedUrl);
            }
            break;
        default: break;
    }
});


/**
 * IPCs to handle episode actions
 */
contextBridge.exposeInMainWorld('episodeAPI', {
    add: (self) => feed.addToEpisodes(self),
    delete: (self) => entries.deleteEntryWithIcon(self)
});


/**
 * IPCs to handle audio player actions
 */
contextBridge.exposeInMainWorld('audioAPI', {
    clickReply: () => audioPlayer.playReply(),
    clickPlayPause: () => audioPlayer.togglePlayPauseButton(),
    clickForward: () => audioPlayer.playForward(),
    clickVolumeToggle: () => audioPlayer.volumeToggle(),
    clickVolume: (self) => audioPlayer.setVolume(self),
    clickVolumeUp: () => audioPlayer.increaseVolume(0.05),
    clickVolumeDown: () => audioPlayer.decreaseVolume(0.05),
    clickSpeedDown: () => audioPlayer.speedDown(),
    clickSpeedUp: () => audioPlayer.speedUp(),
    clickEpisode: (self) => audioPlayer.playNow(self)
});

/**
 * IPCs to handle ompl actions
 */
contextBridge.exposeInMainWorld('opmlAPI', {
    import: (filePath) => opml.import(filePath),
    export: (filePath) => opml.export(filePath)
});

/**
 * NOTE: Used for further implementations
 */
contextBridge.exposeInMainWorld('myAPI', {
    setTitle: (title) => {
        console.log('settitle');
        return { title: title };
    },
    toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
    sysLanguage : () => ipcRenderer.invoke('sys-language')
});

contextBridge.exposeInMainWorld('backendAPI', {
    toggleProperty: (propertyName) => {
        const value = global.getPreference(propertyName);

        // set to true if value is undefined, otherwise use the opposite of the current value
        global.setPreference(propertyName, value === undefined ? true : !value);
    }
});
