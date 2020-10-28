function handleDragStart(_Event) {
    _Event.dataTransfer.setData('text/html', this.innerHTML);
    let img = this.getElementsByTagName("img")[0];
    _Event.dataTransfer.setDragImage(img, img.width/2, img.height/2);

    this.classList.remove('over');
}

function handleDragEnter(obj) {
    $(obj).addClass('over');
}

function handleDragLeave(obj) {
    $(obj).removeClass('over');
    
}

function handleDragOver(obj,_Event) {
    // NOTE: Necessary. Allows us to drop.

    if (_Event.preventDefault) {
        _Event.preventDefault();
    }
    _Event.dataTransfer.dropEffect = 'link';

    return false;
}

function handleDrop(obj, _Event) {
    obj.classList.remove('over');

    var Parser = new DOMParser();
    var XmlDoc = Parser.parseFromString(_Event.dataTransfer.getData('text/html'), "text/xml");
    var PodcastFeedUrl = XmlDoc.getElementsByClassName("podcast-entry-header")[0].getAttribute('feedurl')
    var PlaylistName = obj.getElementsByTagName("input")[0].value

    addToPlaylist(PlaylistName, PodcastFeedUrl)
}