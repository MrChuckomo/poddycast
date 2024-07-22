'use strict';

const global = require('./helper/helper_global');
const json2html = require('node-json2html');

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
    document.getElementById('content-left').style.width = 0;
    document.getElementById('content-right').style.left = 0;
    document.getElementById('sidebar-toggle').style.left = '-6px';
    document.querySelector('#sidebar-toggle i').classList.add('bi-caret-right-fill');
    document.querySelector('#sidebar-toggle i').classList.remove('bi-caret-left-fill');
}
module.exports.hideSidebar = hideSidebar;

function showSidebar () {
    document.getElementById('content-left').style.width = '300px';
    document.getElementById('content-right').style.left = '300px';
    document.getElementById('sidebar-toggle').style.left = '288px';
    document.querySelector('#sidebar-toggle i').classList.add('bi-caret-left-fill');
    document.querySelector('#sidebar-toggle i').classList.remove('bi-caret-right-fill');
}
module.exports.showSidebar = showSidebar;

/**
 * Set a custom text to the right detail panel.
 * It's located on the very bottom of the view.
 *
 * @param {string} _Value
 */
function setDetailPanelSubContent (_Value) {
    let html = json2html.render({value: _Value},
        {
            '<>': 'div',
            'class': 'text-center py-3 my-3',
            'html': [
                {
                    '<>': 'span',
                    'class': 'fs-7 opacity-50',
                    'text': '${value}'
                }
            ]
        }
    );
    document.getElementById('detail-sub-content').innerHTML = html.trim();
}
module.exports.setDetailPanelSubContent = setDetailPanelSubContent;
