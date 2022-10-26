'use strict';

/**
 * Receive menu trigger from main proccess
 * @param {str} value Custom string, defined in the main menu items in main process
 */
window.electronAPI.onTriggerMenu((_event, value, filePath) => {
    switch (value) {
        case 'menu-opml:import': window.opmlAPI.import(filePath); break;
        case 'menu-opml:export': window.opmlAPI.export(filePath); break;
        case 'menu-play-pause': window.audioAPI.clickPlayPause(); break;
        case 'menu-reply': window.audioAPI.clickReply(); break;
        case 'menu-forward': window.audioAPI.clickForward(); break;
        case 'menu-volume-up': window.audioAPI.clickVolumeUp(); break;
        case 'menu-volume-down': window.audioAPI.clickVolumeDown(); break;
        case 'menu-search-input': window.navAPI.clickSearch(); break;
        case 'menu-episodes': window.navAPI.clickEpisodes(); break;
        case 'menu-favorites': window.navAPI.clickFavorites(); break;
        case 'menu-history': window.navAPI.clickHistory(); break;
        case 'menu-statistics': window.navAPI.clickStatistics(); break;
        case 'menu-new_list-input': window.navAPI.clickNewList(); break;
        case 'menu-color:system': window.colorAPI.system(); break;
        case 'menu-color:light': window.colorAPI.light(); break;
        case 'menu-color:dark': window.colorAPI.dark(); break;
        default: break;
    }
});

/**
 * Search field handling
 */
document.getElementById('search-input').addEventListener('keyup', (event) => {
    const value = document.getElementById('search-input').value;
    const key = event.code;
    window.navAPI.searchInput(value, key);
});

/**
 * New playlist field handling
 */
document.getElementById('new_list-input').addEventListener('keyup', (event) => {
    const value = document.getElementById('new_list-input').value;
    const key = event.code;
    window.navAPI.newListInput(value, key);
});
document.getElementById('new_list-button').addEventListener('click', () => {
    window.navAPI.newListButtonInput();
});

/**
 * Main navigation item actions
 */
document.getElementById('menu-episodes').addEventListener('click', () => window.navAPI.clickEpisodes());
document.getElementById('menu-favorites').addEventListener('click', () => window.navAPI.clickFavorites());
document.getElementById('menu-history').addEventListener('click', () => window.navAPI.clickHistory());
document.getElementById('menu-statistics').addEventListener('click', () => window.navAPI.clickStatistics());
document.getElementById('menu-refresh').addEventListener('click', () => window.navAPI.clickRefresh());

/**
 * Audio player actions
 */
document.getElementById('replay-30-sec').addEventListener('click', () => window.audioAPI.clickReply());
document.getElementById('play-pause').addEventListener('click', () => window.audioAPI.clickPlayPause());
document.getElementById('forward-30-sec').addEventListener('click', () => window.audioAPI.clickForward());
document.getElementById('volume-button').addEventListener('click', () => window.audioAPI.clickVolumeToggle());
document.getElementById('volume').addEventListener('input', () => window.audioAPI.clickVolume(document.getElementById('volume')));
document.getElementById('content-right-player-speed-down').addEventListener('click', () => window.audioAPI.clickSpeedDown());
document.getElementById('content-right-player-speed-up').addEventListener('click', () => window.audioAPI.clickSpeedUp());

/**
 * Bundle listern for playlist actions
 */
document.getElementById('playlists').addEventListener('dblclick', function (event) {
    if (event.target.tagName === 'INPUT') {
        window.playlistAPI.dblclickItem(event.target.parentElement);
        event.target.addEventListener('keyup', (event) => {
            window.playlistAPI.rename(event.target, event.code);
        });
        event.target.addEventListener('focusout', () => {
            window.navAPI.loseFocus(event.target);
        });
    }
});
