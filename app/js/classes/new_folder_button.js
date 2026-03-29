"use strict";

const favoritesManager = require('../helper/favorites_manager');
const { ipcRenderer } = require('electron');

class NewFolderButton {
    constructor(options = {}) {
        this.onCreate = options.onCreate || function () {};
        this.button = this._buildButton();
        this.container = null;
    }

    _buildButton() {
        const btn = document.createElement('button');
        btn.id = 'new-folder-button';
        btn.className = 'm-3 px-3 rounded-3 fw-light btn btn-outline-secondary';
        btn.innerHTML = '<i class="bi bi-folder-plus"></i>';
        btn.setAttribute('title', 'New Folder');
        btn.setAttribute('aria-label', 'New Folder');
        ipcRenderer.invoke('i18n', 'New Folder').then((title) => {
            if (title) {
                btn.setAttribute('title', title);
                btn.setAttribute('aria-label', title);
            }
        });
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this._openInput();
        });
        return btn;
    }

    getElement() {
        return this.button;
    }

    attachTo(container) {
        if (typeof container === 'string') container = document.getElementById(container);
        if (!container) throw new Error('Container not found');
        this.container = container;
        container.appendChild(this.button);
    }

    _openInput() {
        if (!this.container) return;
        const headerActions = this.container;
        headerActions.innerHTML = '';
        headerActions.classList.add('new-folder-container');

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Folder Name';
        input.className = 'form-control me-2 new-folder-input';
        input.setAttribute('aria-label', 'Folder Name');
        ipcRenderer.invoke('i18n', 'Folder Name').then((text) => {
            if (text) {
                input.placeholder = text;
                input.setAttribute('aria-label', text);
            }
        });

        const onKey = (ev) => {
            if (ev.key === 'Enter') {
                const name = input.value;
                if (name && name.trim() !== '') {
                    favoritesManager.createFolder(name.trim());
                    this.onCreate(name.trim());
                }
                cleanup();
            } else if (ev.key === 'Escape') {
                cleanup();
            }
        };

        const onDocClick = (ev) => {
            if (ev.target !== input) {
                cleanup();
            }
        };

        const cleanup = () => {
            input.removeEventListener('keydown', onKey);
            document.removeEventListener('click', onDocClick);
            if (this.onCreate) {
                this.onCreate(null);
            }
        };

        input.addEventListener('keydown', onKey);
        setTimeout(() => document.addEventListener('click', onDocClick), 0);

        // position input relative to the viewport so it can expand to a viewport-based width
        const rect = headerActions.getBoundingClientRect();
        input.style.position = 'fixed';
        input.style.right = '12px';
        input.style.top = (rect.top + rect.height / 2) + 'px';
        input.style.transform = 'translateY(-50%)';
        // keep input reasonably sized (fallback to 420px maximum)
        input.style.width = '420px';
        input.style.maxWidth = '420px';
        input.style.boxSizing = 'border-box';
        headerActions.appendChild(input);
        input.focus();
    }
}
module.exports.NewFolderButton = NewFolderButton;
