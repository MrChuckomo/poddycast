var eLayout =
{
    row: 'list-item-row-layout',
    box: 'list-item-box-layout'
}

class cListElement
{
    constructor(_Parts, _LayoutRatio)
    {
        this.Parts = _Parts
        this.LayoutRatio = _LayoutRatio
    }
}

function buildListItem(_JsonObject, _Layout)
{
    var Container = document.createElement("li")

    for (var i = 0; i < _JsonObject.Parts.length; i ++)
    {
        Container.append(_JsonObject.Parts[i])
    }

    Container.classList.add(_Layout)
    Container.style.gridTemplateColumns = _JsonObject.LayoutRatio

    return Container
}

function getListItemPart(_Container, _Position)
{   
    return _Container.children[_Position]
}

// ---------------------------------------------------------------------------------------------------------------------

function getImagePart(_Artwork)
{
    var ImageElement = document.createElement("img")

    ImageElement.src = _Artwork

    return ImageElement
}

function getBoldTextPart(_Text)
{
    var TextElement = document.createElement("div")

    TextElement.innerHTML = _Text
    TextElement.classList.add("list-item-bold-text")

    return TextElement
}

function getTextPart(_Text)
{
    var TextElement = document.createElement("div")

    TextElement.innerHTML = _Text
    TextElement.classList.add("list-item-text")

    return TextElement
}

function getSubTextPart(_Text)
{
    var TextElement = document.createElement("div")

    TextElement.innerHTML = _Text
    TextElement.classList.add("list-item-sub-text")

    return TextElement
}

function getFlagPart(_Text, _Color, _BackgroundColor)
{
    var FlagElement = document.createElement("div")

    FlagElement.innerHTML = _Text
    FlagElement.style.color = _Color
    FlagElement.style.backgroundColor = _BackgroundColor
    FlagElement.classList.add("list-item-flag")

    return FlagElement
}

function getTextButtonPart(_Text)
{
    var ButtonElement = document.createElement("button")

    ButtonElement.text = _Text

    return ButtonElement
}

function getIconButtonPart(_Icon)
{
    var IconButtonElement = document.createElement("div")

    // fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"

    // IconButtonElement.setAttribute('fill', '#000000')
    // IconButtonElement.setAttribute('height', '24')
    // IconButtonElement.setAttribute('viewBox', '0 0 24 24')
    // IconButtonElement.setAttribute('width', '24')
    // IconButtonElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

    IconButtonElement.innerHTML = _Icon
    IconButtonElement.classList.add('list-item-icon')

    return IconButtonElement
}
