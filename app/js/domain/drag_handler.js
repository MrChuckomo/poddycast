'use strict';

const navigation = require('../helper/helper_navigation');

function handleDragStart(dragEvent) {
    dragEvent.dataTransfer.setData('text/html', this.innerHTML);
    dragEvent.dataTransfer.setDragImage(this.getElementsByTagName('img')[0], -10, -10);

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

function handleDragOver(dragEvent) {
    // NOTE: Necessary. Allows us to drop.

    if (dragEvent.preventDefault) {
        dragEvent.preventDefault();
    }

    dragEvent.dataTransfer.dropEffect = 'link';

    return false;
}
module.exports.handleDragOver = handleDragOver;

function handleDrop(dragEvent) {
    this.classList.remove('over');

    let Parser = new DOMParser();
    let XmlDoc = Parser.parseFromString(dragEvent.dataTransfer.getData('text/html'), 'text/xml');
    let PodcastName = XmlDoc.getElementsByClassName('podcast-entry-title')[0].innerHTML;
    let PlaylistName = this.getElementsByTagName('input')[0].value;

    navigation.dragToPlaylist(PlaylistName, PodcastName);
}
module.exports.handleDrop = handleDrop;
