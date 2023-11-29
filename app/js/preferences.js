'use strict';

const { ipcRenderer } = require('electron');
const global = require('./helper/helper_global');

function init() {
    renderSettings();
}
module.exports.init = init;

function renderSettings() {
    const modalBody = document.getElementById('settingsModalBody');

    let translations = [
        ipcRenderer.invoke('i18n', 'Dark Mode'),
        ipcRenderer.invoke('i18n', 'Light Mode'),
        ipcRenderer.invoke('i18n', 'Use system defaults'),

        ipcRenderer.invoke('i18n', 'Proxy Mode'),

        ipcRenderer.invoke('i18n', 'Playback Speed'),
        ipcRenderer.invoke('i18n', 'Volume')
    ];

    // NOTE: Handle translations and the position for the settings items.
    Promise.all(translations).then(values => {
        for (let index = 0; index < 3; index++) {
            const trans = values[index];
            let item = null;
            switch (index) {
                case 0:
                    item = _buildRadioItem('checkDarkmode', trans, 'themeMode', global.getPreference('darkmode'));
                    break;
                case 1:
                    item = _buildRadioItem('checkLightmode', trans, 'themeMode', global.getPreference('lightmode'));
                    break;
                case 2:
                    item = _buildRadioItem('checkSystemmode', trans, 'themeMode', global.getPreference('systemmode'));
                    break;
            }

            modalBody.appendChild(item);
        }

        modalBody.appendChild(document.createElement('hr'));

        for (let index = 3; index < 4; index++) {
            const trans = values[index];
            let item = null;
            switch (index) {
                case 3:
                    item = _buildCheckboxItem('checkProxymode', trans, global.getPreference('proxymode'));
                    break;
            }

            modalBody.appendChild(item);
        }

        modalBody.appendChild(document.createElement('hr'));

        for (let index = 4; index < 6; index++) {
            const trans = values[index];
            let item = null;
            switch (index) {
                case 4:
                    item = _buildRangeSlider('playspeedSlider', trans, global.getPreference('playspeed'), '0', '4', '0.5');
                    break;
                case 5:
                    // TODO: volume is basically set between 0 and 1 - need to be converted to 0 and 100 (for the UI)
                    item = _buildRangeSlider('volumeSlider', trans, global.getPreference('volume'), '0', '100', '1');
                    break;
            }

            modalBody.appendChild(item);
        }
    });
}
module.exports.renderSettings = renderSettings;


// --------------------------------------------------------------------------------------------------------------------

function _buildCheckboxItem(id, label, checked=false) {
    let formCheckInput = document.createElement('input');
    let formCheckLabel = document.createElement('label');
    let formCheck = document.createElement('div');

    formCheckInput.classList.add('form-check-input');
    formCheckInput.type = 'checkbox';
    formCheckInput.checked = checked;
    formCheckInput.id = id;

    formCheckLabel.classList.add('form-check-label');
    formCheckLabel.setAttribute('for', id);
    formCheckLabel.innerText = label;

    formCheck.classList.add('form-check');
    formCheck.appendChild(formCheckInput);
    formCheck.appendChild(formCheckLabel);

    return formCheck;
}

function _buildRadioItem(id, label, groupName, checked=false) {
    let formCheckInput = document.createElement('input');
    let formCheckLabel = document.createElement('label');
    let formCheck = document.createElement('div');

    formCheckInput.classList.add('form-check-input');
    formCheckInput.type = 'radio';
    formCheckInput.name = groupName;
    formCheckInput.checked = checked;
    formCheckInput.value = label;
    formCheckInput.id = id;

    formCheckLabel.classList.add('form-check-label');
    formCheckLabel.setAttribute('for', id);
    formCheckLabel.innerText = label;

    formCheck.classList.add('form-check');
    formCheck.appendChild(formCheckInput);
    formCheck.appendChild(formCheckLabel);

    return formCheck;
}

function _buildRangeSlider(id, label, value, min='0', max='0', step='0.5') {
    let formLabel = document.createElement('label');
    let formInput = document.createElement('input');
    let form = document.createElement('div');

    formLabel.classList.add('form-label');
    formLabel.setAttribute('for', id);
    formLabel.innerText = label;

    formInput.classList.add('form-range');
    formInput.type = 'range';
    formInput.setAttribute('value', value);
    formInput.setAttribute('min', min);
    formInput.setAttribute('max', max);
    formInput.setAttribute('step', step);
    formInput.id = id;

    form.appendChild(formLabel);
    form.appendChild(formInput);

    return form;
}
