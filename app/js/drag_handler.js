'use strict';

const navigation = require('./helper/helper_navigation');

function handleDragStart(_Event) {
    _Event.dataTransfer.setData('text/html', this.innerHTML);
    _Event.dataTransfer.setDragImage(this.getElementsByTagName('img')[0], -10, -10);

    this.classList.remove('over');
}
module.exports.handleDragStart = handleDragStart;

function handleDragEnter() {
    this.classList.add('over');
}
module.exports.handleDragEnter = handleDragEnter;

function handleDragLeave() {
    this.classList.remove('over');
}
module.exports.handleDragLeave = handleDragLeave;

function handleDragOver(_Event) {
    // NOTE: Necessary. Allows us to drop.

    if (_Event.preventDefault) {
        _Event.preventDefault();
    }

    _Event.dataTransfer.dropEffect = 'link';

    return false;
}
module.exports.handleDragOver = handleDragOver;

function handleDrop(_Event) {
    this.classList.remove('over');

    let Parser = new DOMParser();
    console.log(_Event.dataTransfer.getData('text/html'));
    let XmlDoc = Parser.parseFromString(_Event.dataTransfer.getData('text/html'), 'text/xml');
    let PodcastName = XmlDoc.getElementsByClassName('podcast-entry-title')[0].innerHTML;
    let PlaylistName = this.getElementsByTagName('input')[0].value;

    navigation.dragToPlaylist(PlaylistName, PodcastName);
}
module.exports.handleDrop = handleDrop;
