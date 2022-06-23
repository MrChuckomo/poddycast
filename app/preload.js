'use strict';

const { ipcRenderer, contextBridge } = require('electron');
// window.i18n = new (require('./translations/i18n'));
const feed = require('./js/feed');
const search = require('./js/search');
const global = require('./js/helper/helper_global');
// const navigation = require('./js/helper/helper_navigation');
const entries = require('./js/helper/helper_entries');
const audioPlayer = require('./js/player');
// const playlist = require('./js/playlist');
// const favorite = require('./js/favorite');
// const menu = require('./menu');
const menujs = require('./js/menu');
// const translations = require('./js/translations');

window.addEventListener('DOMContentLoaded', () => {
    global.init();
    // playlist.loadPlaylists();
    feed.readFeeds();
    menujs.showNewEpisodes();
    // navigation.setItemCounts();
    // translations.translate();
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
        menujs.selectMenuItem('menu-episodes');
        menujs.showNewEpisodes();
    },
    clickFavorites: () => {
        menujs.selectMenuItem('menu-favorites');
        menujs.showFavorites();
    },
    clickPodcast: (element) => {
        console.log(element);
        feed.showAllEpisodes(element);
    },
    clickHistory: () => {
        menujs.selectMenuItem('menu-history');
        menujs.showHistory();
    },
    clickStatistics: () => {
        menujs.selectMenuItem('menu-statistics');
        menujs.showStatistics();
    },
    clickRefresh: () => {
        feed.readFeeds();
    }
});






// NOTE: Definition of IPC APIs - might be usefull for the other tasks
contextBridge.exposeInMainWorld('myAPI', {
    setTitle: (title) => {
        console.log('settitle');
        return { title: title };
    },
    doAThing: () => console.log('do a thing'),
    toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
});

contextBridge.exposeInMainWorld('msgAPI', {
    readFeeds: () => feed.readFeeds()
});
