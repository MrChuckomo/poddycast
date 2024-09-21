'use strict';

const global = require('../helper/helper_global');

function init () {
    const hidePref = global.getPreference('hide_sidebar');
    (hidePref === true) ? hide() : show();
}
module.exports.init = init;

function toggle (hidePref) {
    global.setPreference('hide_sidebar', !hidePref);
    hidePref = global.getPreference('hide_sidebar');
    (hidePref === true) ? hide() : show();
}
module.exports.toggle = toggle;

function hide () {
    document.getElementById('content-left').style.width = 0;
    document.getElementById('content-right').style.left = 0;
    document.getElementById('sidebar-toggle').style.left = '-6px';
    document.querySelector('#sidebar-toggle i').classList.add('bi-caret-right-fill');
    document.querySelector('#sidebar-toggle i').classList.remove('bi-caret-left-fill');
}
module.exports.hide = hide;

function show () {
    document.getElementById('content-left').style.width = '300px';
    document.getElementById('content-right').style.left = '300px';
    document.getElementById('sidebar-toggle').style.left = '288px';
    document.querySelector('#sidebar-toggle i').classList.add('bi-caret-left-fill');
    document.querySelector('#sidebar-toggle i').classList.remove('bi-caret-right-fill');
}
module.exports.show = show;
