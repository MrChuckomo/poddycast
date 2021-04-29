'use strict'

function CPlayer () {
    this.isPlaying = function (_FeedUrl) {
        let PlayerSource = document.getElementsByTagName('source')[0]

        return (PlayerSource.getAttribute('src') === _FeedUrl)
    }

    this.getPrettyTime = function (_Time) {
        return ((_Time < 10) ? '0' + _Time : _Time)
    }
}

module.exports = CPlayer
