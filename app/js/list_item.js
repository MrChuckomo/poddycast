'use strict'

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
    let Container = document.createElement('li')

    for (let i = 0; i < _JsonObject.Parts.length; i ++) {
        Container.append(_JsonObject.Parts[i])
    }

    Container.classList.add(_Layout)
    Container.style.gridTemplateColumns = _JsonObject.LayoutRatio

    return Container
}

function getListItemPart(_Container, _Position) {
    return _Container.children[_Position]
}

// ---------------------------------------------------------------------------------------------------------------------

function getImagePart(_Artwork) {
    let ImageElement = document.createElement('img')

    ImageElement.src = _Artwork

    return ImageElement
}

function getBoldTextPart(_Text) {
    let TextElement = document.createElement('div')

    TextElement.innerHTML = sanitizeString(_Text)
    TextElement.classList.add('list-item-bold-text')

    return TextElement
}

function getTextPart(_Text) {
    let TextElement = document.createElement('div')

    TextElement.innerHTML = sanitizeString(_Text)
    TextElement.classList.add('list-item-text')

    return TextElement
}

function getDescriptionPart(_Icon, _Text) {
    let TextElement = document.createElement('div')

    TextElement.innerHTML = _Icon
    TextElement.title = sanitizeString(_Text)
    TextElement.classList.add('list-item-description')
    TextElement.classList.add('list-item-icon')

    return TextElement
}

function getSubTextPart(_Text) {
    let TextElement = document.createElement('div')

    TextElement.innerHTML = sanitizeString(_Text)
    TextElement.classList.add('list-item-sub-text')

    return TextElement
}

function getFlagPart(_Text, _Color, _BackgroundColor) {
    let FlagElement = document.createElement('div')

    FlagElement.innerHTML = sanitizeString(_Text)
    FlagElement.style.color = _Color
    FlagElement.style.backgroundColor = _BackgroundColor
    FlagElement.classList.add('list-item-flag')

    return FlagElement
}

function getTextButtonPart(_Text) {
    let ButtonElement = document.createElement('button')

    ButtonElement.text = sanitizeString(_Text)

    return ButtonElement
}

function getIconButtonPart(_Icon) {
    let IconButtonElement = document.createElement('div')

    IconButtonElement.innerHTML = _Icon
    IconButtonElement.classList.add('list-item-icon')

    return IconButtonElement
}
