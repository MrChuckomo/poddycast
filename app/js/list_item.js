var eLayout = {
    row: 'list-item-row-layout',
    box: 'list-item-box-layout'
}

class cListElement {
    constructor(_Parts, _LayoutRatio) {
        this.Parts = _Parts
        this.LayoutRatio = _LayoutRatio
    }
}

function buildListItem(_JsonObject, _Layout) {
    var Container = document.createElement("li")

    for (var i = 0; i < _JsonObject.Parts.length; i ++)
        Container.append(_JsonObject.Parts[i])

    Container.classList.add(_Layout)
    Container.style.gridTemplateColumns = _JsonObject.LayoutRatio

    return Container
}

/*
function getListItemPart(_Container, _Position)
{
    return _Container.children[_Position]
}
*/

// ---------------------------------------------------------------------------------------------------------------------

function getImagePart(_Artwork) {
    var ImageElement = document.createElement("img")

    ImageElement.src = _Artwork

    return ImageElement
}

function getBoldTextPart(_Text) {
    var TextElement = document.createElement("div")

    TextElement.innerHTML = _Text
    TextElement.classList.add("list-item-bold-text")

    return TextElement
}

/*
function getTextPart(_Text) {
    return $(
        `<div class="list-item-text" style="height:100%">
            <div style="-webkit-font-smoothing: subpixel-antialiased;position: relative;top: 50%;transform: translate3d(+50%, -50%, 0) scale(2, 2);zoom: 0.5;">${_Text}</div>
        </div>`).get(0); 
}
*/

function getTextPart(_Text) {
    return $(
        `<div class="list-item-text">
            ${_Text}
        </div>`).get(0); 
}

function getDescriptionPart(_Icon, _Text) {
    var TextElement = document.createElement("div")

    TextElement.innerHTML = _Icon
    // TextElement.title = _Text
    // TextElement.setAttribute('description', _Text)
    TextElement.classList.add("list-item-description")
    TextElement.classList.add('list-item-icon')

    return TextElement
}

function getSubTextPart(_Text) {
    var TextElement = document.createElement("div")

    TextElement.innerHTML = _Text
    TextElement.classList.add("list-item-sub-text")

    return TextElement
}

function getFlagPart(text) {
    return $(
        `<div class="list-item-flag">
            ${text}
        </div>`
    );
}

function getProgressionFlagPart(episodeUrl) {
    return allFeeds.playback.ui.getProgressionFlag(episodeUrl);
}

/*
function getTextButtonPart(_Text) {
    var ButtonElement = document.createElement("button");
    ButtonElement.text = _Text;

    return ButtonElement;
}
*/

function getIconButtonPart(_Icon) {
    var IconButtonElement = document.createElement("div");
    IconButtonElement.innerHTML = _Icon;
    IconButtonElement.classList.add('list-item-icon');

    return IconButtonElement;
}

function getAddEpisodeButtonPart(addOrReomveIcon) {
    let button = null;
    switch(addOrReomveIcon) {
        case 'add':
            button = getIconButtonPart(s_AddEpisodeIcon);
            button.title = i18n.__("Add to archive");
            break;
        case 'remove':
            button = getIconButtonPart(s_RemoveEpisodeIcon);
            button.title = i18n.__("Remove from archive");
            break;

    }

    button.getElementsByTagName('svg')[0].onclick = function (event) {
        event.stopPropagation(); 

        switch(addOrReomveIcon) {
            case 'add':
                addToArchive(this);
                $(this)
                    .stop()
                    .animate(
                        {opacity: 0.6}, 
                        120, 
                        function() {
                            $(this)
                                .html($(s_RemoveEpisodeIcon).html())
                                .animate(
                                    {opacity: 1.0}, 
                                    120, 
                                    function () {
                                        $(this)
                                            .removeAttr('style')
                                            .parent()
                                            .attr('title', i18n.__("Remove from archive"));
                                    });
                        }
                    );
                //this.innerHTML = s_RemoveEpisodeIcon;
                //button.title = i18n.__("Remove from archive");
                addOrReomveIcon = 'remove';
                break;
            case 'remove':
                removeFromArchive(this);
                $(this)
                    .stop()
                    .animate(
                        {opacity: 0.5}, 
                        120, 
                        function() {
                            $(this)
                                .html($(s_AddEpisodeIcon).html())
                                .animate(
                                    {opacity: 1.0}, 
                                    120, 
                                    function () {
                                        $(this)
                                            .removeAttr('style')
                                            .parent()
                                            .attr('title', i18n.__("Add to archive"));
                                    });
                        }
                    );
                //this.innerHTML = s_AddEpisodeIcon;
                //button.title = i18n.__("Add to archive");
                addOrReomveIcon = 'add';
                break;
        }
    }
    return button;
}

function getDeleteButtonPart() {
    let deleteButton = getIconButtonPart(s_DeleteIcon);
    deleteButton.getElementsByTagName('svg')[0].onclick = function (event) {
        event.stopPropagation(); 
        removeFromArchive(this);
    }
    return deleteButton;
}