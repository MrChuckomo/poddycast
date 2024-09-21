'use strict';

const json2html = require('node-json2html');

/**
 * Set a custom text to the right detail panel.
 * It's located on the very bottom of the view.
 *
 * @param {string} _Value
 */
function setDetailPanelSubContent (_Value) {
    let html = json2html.render({value: _Value},
        {
            '<>': 'div',
            'class': 'text-center py-3 my-3',
            'html': [
                {
                    '<>': 'span',
                    'class': 'fs-7 opacity-50',
                    'text': '${value}'
                }
            ]
        }
    );
    document.getElementById('detail-sub-content').innerHTML = html.trim();
}
module.exports.setDetailPanelSubContent = setDetailPanelSubContent;
