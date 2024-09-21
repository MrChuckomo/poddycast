/* eslint-disable indent */
'use strict';

const global = require('../helper/helper_global');

/**
 * Toggle the dark mode based on three differnt options:
 * systemmode
 * lightmode
 * darkmode
 * @param {*} mode - Color scheme mode
 */
function toggleDarkMode(mode) {
    switch (mode) {
        case 'systemmode':
            global.setPreference('darkmode', false);
            global.setPreference('lightmode', false);
            global.setPreference('systemmode', true);
            removeDarkSchemeLinks();
            addSystemColorSchemeLinks();
            break;
        case 'lightmode':
            global.setPreference('darkmode', false);
            global.setPreference('lightmode', true);
            global.setPreference('systemmode', false);
            removeDarkSchemeLinks();
            break;
        case 'darkmode':
            global.setPreference('darkmode', true);
            global.setPreference('lightmode', false);
            global.setPreference('systemmode', false);
            removeDarkSchemeLinks();
            addDarkSchemeLink();
            break;
        default:
            break;
    }
}
module.exports.toggleDarkMode = toggleDarkMode;

function initDarkMode() {
    if (global.getPreference('darkmode', false) === true) {
        addDarkSchemeLink();
    } else if (global.getPreference('lightmode', false) === true) {
        removeDarkSchemeLinks();
    } else {
        addSystemColorSchemeLinks();
    }
}
module.exports.initDarkMode = initDarkMode;


// --------------------------------------------------------------------------------------------------------------------

/**
 * @private
 */
function removeDarkSchemeLinks() {
    let Links = document
        .getElementsByTagName('head')[0]
        .getElementsByTagName('link');

    // safety net for removing any dark mode css links
    for (let i = 0; i < Links.length; i++) {
        if (Links[i].getAttribute('href').includes('dark_layout')) {
            Links[i].remove();
        }
    }
}

/**
 * @private
 */
function addDarkSchemeLink() {
    let stylesheet = document.createElement('link');
    stylesheet.setAttribute('rel', 'stylesheet');
    stylesheet.setAttribute('href', './css/dark_layout.css');
    document.getElementsByTagName('head')[0].append(stylesheet);
}

/**
 * @private
 */
function addSystemColorSchemeLinks() {
    let stylesheet = document.createElement('link');
    stylesheet.setAttribute('rel', 'stylesheet');
    stylesheet.setAttribute('href', './css/dark_layout.css');
    stylesheet.setAttribute('media', '(prefers-color-scheme: dark)');
    document.getElementsByTagName('head')[0].append(stylesheet);
}
