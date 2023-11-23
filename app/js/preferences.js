'use strict';

const global = require('./helper/helper_global');

function init() {
    console.log('darkmode', global.getPreference('darkmode'));
    console.log('minimize', global.getPreference('minimize'));
    console.log('proxymode', global.getPreference('proxymode'));
    console.log('playspeed', global.getPreference('playspeed'));
    console.log('volume', global.getPreference('volume'));
    console.log('lightmode', global.getPreference('lightmode'));
    console.log('systemmode', global.getPreference('systemmode'));
}
module.exports.init = init;
