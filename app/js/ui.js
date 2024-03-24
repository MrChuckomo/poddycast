'use strict';

const global = require('./helper/helper_global');

function initSidebar () {
    const hide = global.getPreference('hide_sidebar');
    (hide === true) ? hideSidebar() : showSidebar();
}
module.exports.initSidebar = initSidebar;

function toggleSidebar (hide) {
    global.setPreference('hide_sidebar', !hide);
    hide = global.getPreference('hide_sidebar');
    (hide === true) ? hideSidebar() : showSidebar();
}
module.exports.toggleSidebar = toggleSidebar;

function hideSidebar () {
    console.log('hide');
    document.getElementById('content-left').style.width = 0;
    document.getElementById('content-right').style.left = 0;
    document.getElementById('sidebar-toggle').style.left = '-6px';
    document.querySelector('#sidebar-toggle i').classList.add('bi-caret-right-fill');
    document.querySelector('#sidebar-toggle i').classList.remove('bi-caret-left-fill');
}

function showSidebar () {
    console.log('show');
    document.getElementById('content-left').style.width = '300px';
    document.getElementById('content-right').style.left = '300px';
    document.getElementById('sidebar-toggle').style.left = '288px';
    document.querySelector('#sidebar-toggle i').classList.add('bi-caret-left-fill');
    document.querySelector('#sidebar-toggle i').classList.remove('bi-caret-right-fill');
}
