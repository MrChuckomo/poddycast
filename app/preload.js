'use strict';

const { ipcRenderer, contextBridge } = require('electron');
const feed = require('./js/feed');
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
    playlist.loadPlaylists();
    feed.readFeeds();
    nav.initLocalization();
    nav.showNewEpisodes();
    navigation.setItemCounts();
    audioPlayer.init();
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
    clickEpisodes: () => {
        nav.selectMenuItem('menu-episodes');
        nav.showNewEpisodes();
    },
    clickFavorites: () => {
        nav.selectMenuItem('menu-favorites');
        nav.showFavorites();
    },
    clickPodcast: (element) => {
        console.log(element);
        feed.showAllEpisodes(element);
    },
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
    loseFocus: (element) => navigation.clearRenameFocus(element)
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
    rename: (element, key) => playlist.renamePlaylist(element, key)
});


/**
 * IPCs to handle playlist actions
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
