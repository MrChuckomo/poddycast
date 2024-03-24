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
}

function showSidebar () {
    console.log('show');
    document.getElementById('content-left').style.width = '300px';
    document.getElementById('content-right').style.left = '300px';
}
