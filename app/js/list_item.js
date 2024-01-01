'use strict';

const global = require('./helper/helper_global');
const animation = require('./animation.js');
const json2html = require('node-json2html');

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

    animation.playListAnimation();

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


/**
 *
 * @param {string} _Progress - value as string in percentage (0-100)
 * @returns {DOMElement}
 */
function getProgressPart(_Progress) {
    let ProgressElement = document.createElement('div');
    let Progress = document.createElement('div');

    ProgressElement.classList.add('list-item-progress-container');
    Progress.classList.add('list-item-progress');
    Progress.style.width = _Progress ? _Progress + '%' : '0%';

    ProgressElement.appendChild(Progress);

    return ProgressElement;
}
module.exports.getProgressPart = getProgressPart;

// * ---------------------------------------------------------------------------------------------------------------------
// * NEW Render Section using Json2Html

/**
 * @param {object} _JsonData - Array of objects, keys used in template
 * @returns {DOMElement}
 */
function renderNewEpisodeItem(_JsonData) {
    let html = json2html.render(_JsonData,
        {
            '<>': 'li',
            'class': 'card border-0 m-3 ${selected}',
            'aria-label': 'main-container',
            'style': 'background-color: var(--episode-item-bg-color)',
            'channel': '${channel}',
            'title': '${name}',
            'type': '${type}',
            'url': '${url}',
            'length': '${length}',
            'artworkUrl': '${artwork}',
            'episodeImagekUrl': '${episodeImagekUrl}',
            'html': [
                {
                    '<>': 'div', //* NOTE: Row #1
                    'class': 'd-flex flex-row p-3 pb-2',
                    'aria-label': 'main-layout',
                    'html': [
                        {
                            '<>': 'img',
                            'class': 'rounded shadow-sm',
                            'style': 'width: 55px; height: 55px',
                            'src': '${artwork}'
                        },
                        {
                            '<>': 'div',
                            'class': 'flex-fill px-3',
                            'aria-label': 'podcast-info',
                            'html': [
                                {
                                    '<>': 'div',
                                    'class': 'text-truncate fw-bold fs-6',
                                    'style': 'max-width: 450px',
                                    'text': '${name}'
                                },
                                {
                                    '<>': 'div',
                                    'class': 'fs-7',
                                    'text': 'by ${channel}'
                                },
                                {
                                    '<>': 'div',
                                    'class': 'fs-7 opacity-75',
                                    'html': [
                                        { '<>': 'i', 'class': 'bi bi-stopwatch pe-1' },
                                        { '<>': 'span', 'text': '${duration}' }
                                    ]
                                }
                            ]
                        },
                        // TODO: display shownotes
                        // {
                        //     '<>': 'a',
                        //     'class': 'btn btn-primary',
                        //     'data-bs-toggle': 'collapse',
                        //     'href': '#collapseExample',
                        //     'role': 'button',
                        //     'aria-expanded': 'false',
                        //     'aria-controls': 'collapseExample',
                        //     'text': 'Desc'
                        // },
                        // {
                        //     '<>': 'div',
                        //     'id': 'collapseExample',
                        //     'class': 'collapse',
                        //     'html': '${description}'
                        // },
                        {
                            '<>': 'div',
                            'class': 'opacity-75 align-self-center px-3',
                            'aria-label': 'podcast-actions',
                            'html': [
                                // {
                                //     '<>': 'i',
                                //     'class': 'bi bi-info-circle fs-5 d-block'
                                // },
                                {
                                    '<>': 'i',
                                    'class': 'bi bi-trash3 fs-5 d-block',
                                }
                            ]
                        }
                    ]
                },
                {
                    '<>': 'div', //* NOTE: Row #2
                    'class': 'd-flex flex-row',
                    'aria-label': 'podcast-progress',
                    'html': [
                        {
                            '<>': 'div',
                            'class': 'progress rounded-0',
                            'style': 'height: 8px; width: 100%; background-color: var(--progress-bg-color)!important; border-radius: 0 0 0.375rem 0.375rem!important;',
                            'role': 'progressbar',
                            'aria-valuemin': '0',
                            'aria-valuemax': '100',
                            'html': [
                                {
                                    '<>': 'div',
                                    'class': 'progress-bar',
                                    'style': 'width: ${progress}%; background-color: var(--progress-color)'

                                    // ProgressElement.classList.add('list-item-progress-container');
                                    // Progress.classList.add('list-item-progress');
                                    // Progress.style.width = _Progress ? _Progress + '%' : '0%';
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    );

    const template = document.createElement('template');
    template.innerHTML = html.trim();

    let child = template.content.firstElementChild;

    // Action for list item: play expisode
    child.setAttribute('onclick', 'window.audioAPI.clickEpisode(this)');

    // Action to delete list item
    child.querySelector('.bi-trash3').setAttribute(
        'onclick',
        'event.stopPropagation(); window.episodeAPI.delete(this, 3)'
    );

    return child;
}
module.exports.renderNewEpisodeItem = renderNewEpisodeItem;
