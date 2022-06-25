'use strict';

const { ipcRenderer, contextBridge } = require('electron');
const feed = require('./js/feed');
const search = require('./js/search');
const global = require('./js/helper/helper_global');
// const navigation = require('./js/helper/helper_navigation');
const entries = require('./js/helper/helper_entries');
const audioPlayer = require('./js/player');
const playlist = require('./js/playlist');
// const favorite = require('./js/favorite');
// const menu = require('./menu');
const nav = require('./js/nav');

window.addEventListener('DOMContentLoaded', () => {
    global.init();
    playlist.loadPlaylists();
    feed.readFeeds();
    nav.initLocalization();
    nav.showNewEpisodes();
    // navigation.setItemCounts();
    // audioPlayer.init();
});


/**
 * IPCs to handle actions on the left side navigation
 */
contextBridge.exposeInMainWorld('navAPI', {
    searchInput: (value, key) => {
        search.search(value, key);
    },
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
    clickRefresh: () => {
        feed.readFeeds();
    }
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
    clickSpeedDown: () => audioPlayer.speedDown(),
    clickSpeedUp: () => audioPlayer.speedUp()
});




// NOTE: Definition of IPC APIs - might be usefull for the other tasks
contextBridge.exposeInMainWorld('myAPI', {
    setTitle: (title) => {
        console.log('settitle');
        return { title: title };
    },
    doAThing: () => console.log('do a thing'),
    toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
    sysLanguage : () => ipcRenderer.invoke('sys-language')
});

contextBridge.exposeInMainWorld('msgAPI', {
    readFeeds: () => feed.readFeeds()
});
