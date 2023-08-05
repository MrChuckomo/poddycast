'use strict';

const anime = require('animejs');

function playListAnimation() {
    anime({
        targets: '.list-item-row-layout img',
        translateX: [-15, 0],
        opacity: [0, 1],
        duration: 600,
        easing: 'easeInOutExpo'
    });
}
module.exports.playListAnimation = playListAnimation;
