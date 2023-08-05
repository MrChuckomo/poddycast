// https://animejs.com/documentation/#cssSelector

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

function playListDeleteAnimation(el) {
    anime({
        targets: el,
        translateX: [0, -500],
        opacity: [1, 0],
        duration: 600,
        easing: 'easeInOutExpo'
    });
}
module.exports.playListDeleteAnimation = playListDeleteAnimation;
