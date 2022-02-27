'use strict';

function translate() {
    const i18n = window.i18n;
    changeByClass('new-episodes', i18n.__('New Episodes'));
    changeByClass('favorites', i18n.__('Favorites'));
    changeByClass('history', i18n.__('History'));
    changeByClass('playlists', i18n.__('Playlists'));
    changeByClass('refresh', i18n.__('Refresh'));
    changeByClass('statistics', i18n.__('Statistics'));
    document.getElementsByName('search')[0].placeholder = i18n.__('Search');
    document.getElementsByName('new_list')[0].placeholder = i18n.__('New List');
    document.getElementById('content-right-player-title').innerHTML = i18n.__('No episode selected');
}
module.exports.translate = translate;

function changeByClass(className, value) {
    let els = document.getElementsByClassName(className);

    Array.prototype.forEach.call(els, function(el) {
        // Do stuff here
        el.innerHTML= value;
    });
}
