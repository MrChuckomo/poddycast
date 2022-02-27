'use strict';

const global = require('./helper/helper_global');

function darkMode() {
    let stylesheet = document.createElement('link');
    stylesheet.setAttribute('rel', 'stylesheet');
    stylesheet.setAttribute('href', './css/dark_layout.css');

    if (global.getPreference('darkmode', false)) {
        global.setPreference('darkmode', true);

        document.getElementsByTagName('head')[0].append(stylesheet);
    } else {
        global.setPreference('darkmode', false);

        let Links = document
            .getElementsByTagName('head')[0]
            .getElementsByTagName('link');

        for (let i = 0; i < Links.length; i++) {
            if (Links[i].getAttribute('href').includes('dark_layout')) {
                Links[i].parentElement.removeChild(Links[i]);
                break;
            }
        }
    }
}
module.exports.darkMode = darkMode;
