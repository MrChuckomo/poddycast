'use strict';

const global = require('./helper/helper_global');

function toggleDarkMode() {
    if (global.getPreference('darkmode', false) === false) {
        global.setPreference('darkmode', true);

        let stylesheet = document.createElement('link');
        stylesheet.setAttribute('rel', 'stylesheet');
        stylesheet.setAttribute('href', './css/dark_layout.css');
        document.getElementsByTagName('head')[0].append(stylesheet);
    } else {
        global.setPreference('darkmode', false);

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
}
module.exports.toggleDarkMode = toggleDarkMode;

function initDarkMode() {
    if (global.getPreference('darkmode', false) === true) {
        let stylesheet = document.createElement('link');
        stylesheet.setAttribute('rel', 'stylesheet');
        stylesheet.setAttribute('href', './css/dark_layout.css');
        document.getElementsByTagName('head')[0].append(stylesheet);
    } else {
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
}
module.exports.initDarkMode = initDarkMode;
