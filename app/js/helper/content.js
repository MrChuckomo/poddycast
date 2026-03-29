'use strict';

function CContentHelper () {
    // ---------------------------------------------------------------------------------------------------------------------
    // RIGHT COLUMN
    // ---------------------------------------------------------------------------------------------------------------------

    this.clearContent = function () {
        const list = document.getElementById('list');
        list.innerHTML = '';
        list.classList.remove('favorites-view');
        document.getElementById('detail-sub-content').innerHTML = '';
    };

    this.clearListSelection = function () {
        let ListItems = document.getElementById('list').getElementsByTagName('li');

        for (let i = 0; i < ListItems.length; i++) {
            ListItems[i].classList.remove('select-episode');
        }
    };

    this.setHeader = function (_Title) {
        let Header = document.getElementById('content-right').getElementsByTagName('h1')[0];

        Header.innerHTML = _Title;
    };
}

module.exports = CContentHelper;
