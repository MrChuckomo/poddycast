'use strict';

const global = require('./helper/helper_global');

const eLayout = {
    row: 'list-item-row-layout',
    box: 'list-item-box-layout'
};
module.exports.eLayout = eLayout;

class cListElement {
    constructor(_Parts, _LayoutRatio) {
        this.Parts = _Parts;
        this.LayoutRatio = _LayoutRatio;
    }
}
module.exports.cListElement = cListElement;

function buildListItem(_JsonObject, _Layout) {
    let Container = document.createElement('li');

    for (let i = 0; i < _JsonObject.Parts.length; i ++) {
        Container.append(_JsonObject.Parts[i]);
    }

    Container.classList.add(_Layout);
    Container.style.gridTemplateColumns = _JsonObject.LayoutRatio;

    return Container;
}
module.exports.buildListItem = buildListItem;

// TODO: Remove because it is not being used
// eslint-disable-next-line no-unused-vars
function getListItemPart(_Container, _Position) {
    return _Container.children[_Position];
}

// ---------------------------------------------------------------------------------------------------------------------

function getImagePart(_Artwork) {
    let ImageElement = document.createElement('img');

    ImageElement.src = _Artwork;

    return ImageElement;
}
module.exports.getImagePart = getImagePart;

function getBoldTextPart(_Text) {
    let TextElement = document.createElement('div');

    TextElement.innerHTML = global.sanitizeString(_Text);
    TextElement.classList.add('list-item-bold-text');

    return TextElement;
}
module.exports.getBoldTextPart = getBoldTextPart;

function getTextPart(_Text) {
    let TextElement = document.createElement('div');

    TextElement.innerHTML = global.sanitizeString(_Text);
    TextElement.classList.add('list-item-text');

    return TextElement;
}
module.exports.getTextPart = getTextPart;

function getDescriptionPart(_Icon, _Text) {
    let TextElement = document.createElement('div');

    TextElement.innerHTML = _Icon;
    TextElement.title = global.sanitizeString(_Text);
    TextElement.classList.add('list-item-description');
    TextElement.classList.add('list-item-icon');

    return TextElement;
}
module.exports.getDescriptionPart = getDescriptionPart;

function getSubTextPart(_Text) {
    let TextElement = document.createElement('div');

    TextElement.innerHTML = global.sanitizeString(_Text);
    TextElement.classList.add('list-item-sub-text');

    return TextElement;
}
module.exports.getSubTextPart = getSubTextPart;

function getFlagPart(_Text, _Color, _BackgroundColor) {
    let FlagElement = document.createElement('div');

    FlagElement.innerHTML = global.sanitizeString(_Text);
    FlagElement.style.color = _Color;
    FlagElement.style.backgroundColor = _BackgroundColor;
    FlagElement.classList.add('list-item-flag');

    return FlagElement;
}
module.exports.getFlagPart = getFlagPart;

function getTextButtonPart(_Text) {
    let ButtonElement = document.createElement('button');

    ButtonElement.text = global.sanitizeString(_Text);

    return ButtonElement;
}
module.exports.getTextButtonPart = getTextButtonPart;

function getIconButtonPart(_Icon) {
    let IconButtonElement = document.createElement('div');

    IconButtonElement.innerHTML = _Icon;
    IconButtonElement.classList.add('list-item-icon');

    return IconButtonElement;
}
module.exports.getIconButtonPart = getIconButtonPart;
