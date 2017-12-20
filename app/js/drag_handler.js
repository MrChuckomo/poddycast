
function handleDragStart(_Event)
{
    _Event.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnter(_Event)
{
    this.classList.add('over');
}

function handleDragLeave(_Event)
{
    this.classList.remove('over');
}

function handleDragOver(_Event)
{
    // NOTE: Necessary. Allows us to drop.

    if (_Event.preventDefault)
    {
        _Event.preventDefault();
    }

    _Event.dataTransfer.dropEffect = 'move';

    return false;
}

function handleDrop(_Event)
{
    this.classList.remove('over');

    var Parser       = new DOMParser();
    var XmlDoc       = Parser.parseFromString(_Event.dataTransfer.getData('text/html'), "text/xml");
    var PodcastName  = XmlDoc.getElementsByClassName("podcast-entry-title")[0].innerHTML
    var PlaylistName = this.getElementsByTagName("input")[0].value

    dragToPlaylist(PlaylistName, PodcastName)
}
