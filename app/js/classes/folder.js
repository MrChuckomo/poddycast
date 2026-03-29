'use strict';

const dndHelper = require('../domain/drag_handler');
const favoritesManager = require('../helper/favorites_manager');
const { ipcRenderer } = require('electron');
const { Podcast } = require('./podcast');
const nav = require('../domain/nav');

class FolderUI {
    constructor(folderObj) {
        this.folderObj = folderObj || { folderName: 'Folder', items: [] };
    }

    getElement() {
        const folderObj = this.folderObj;

        const li = document.createElement('li');
        li.className = 'podcast-entry favorites-folder-entry';
        li.draggable = false;
        // Render folder as a tile similar to podcasts: icon above, name below
        li.innerHTML = `
            <div class="podcast-entry-header" data-foldername="${folderObj.folderName || ''}">
                <i class="bi bi-folder-fill folder-icon"></i>
                <div class="podcast-entry-title fw-normal">${folderObj.folderName || 'Folder'}</div>
                <div class="podcast-entry-tail"></div>
            </div>
            <div class="podcast-entry-actions"></div>
            <div class="podcast-entry-body"></div>
        `;

        // allow drag and drop of podcasts onto the folder
        const childList = document.createElement('ul');
        childList.className = 'favorites-folder-list visually-hidden';

        // clicking folder opens folder detail view
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showDetail();
        });
        
        li.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dndHelper.setMoveEffect(e);
            li.classList.add('drag-over');
        }, true);

        li.addEventListener('dragleave', (e) => {
            e.stopPropagation();
            li.classList.remove('drag-over');
        }, true);

        li.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            li.classList.remove('drag-over');
            const feedUrl = dndHelper.safeReadDataTransfer(e);
            if (feedUrl) {
                const moved = dndHelper.movePodcastToList(feedUrl, childList);
                const ok = favoritesManager.movePodcastToFolder(feedUrl, folderObj.folderName);
                if (ok && moved) {
                    folderObj.items = folderObj.items || [];
                    folderObj.items.push(moved);
                }
                if (!ok) {
                    console.error('Failed to persist movePodcastToFolder for', feedUrl, '->', folderObj.folderName);
                }
            }
        }, true);

        return li;
    }

    showDetail() {
        const folderObj = this.folderObj;
        const self = this;
        const CContentHelper = require('../helper/content');
        const helper = new CContentHelper();
        const navigation = require('../helper/helper_navigation');

        helper.clearContent();
        navigation.setHeaderViewAction();

        const List = document.getElementById('list');
        navigation.setGridLayout(List, false);

        const SettingsDiv = document.createElement('div');
        SettingsDiv.classList.add('settings');

        // show a folder icon instead of an image element
        const FolderImage = document.createElement('i');
        FolderImage.classList.add('settings-image', 'bi', 'bi-folder-fill');

        const folderNameDiv = document.createElement('div');
        folderNameDiv.classList.add('settings-header');
        folderNameDiv.innerText = folderObj.folderName || 'Folder';
        if (!folderObj.folderName) {
            ipcRenderer.invoke('i18n', 'Folder').then((text) => {
                if (text) folderNameDiv.innerText = text;
            });
        }

        const CountDiv = document.createElement('div');
        CountDiv.classList.add('settings-count');
        const count = (Array.isArray(folderObj.items)) ? folderObj.items.filter(i => i && i.feedUrl).length : 0;
        // The CSS .settings-count::before already injects the label "All:",
        // so only set the numeric value here to avoid duplicate labels.
        CountDiv.innerText = String(count);

        const renameBtn = document.createElement('button');
        renameBtn.className = 'btn btn-sm btn-outline-secondary me-2';
        renameBtn.setAttribute('title', 'Rename');
        renameBtn.setAttribute('aria-label', 'Rename');
        ipcRenderer.invoke('i18n', 'Rename').then((title) => { if (title) { renameBtn.setAttribute('title', title); renameBtn.setAttribute('aria-label', title); } });
        renameBtn.innerHTML = '<i class="bi bi-pencil"></i>';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger';
        deleteBtn.setAttribute('title', 'Delete');
        deleteBtn.setAttribute('aria-label', 'Delete');
        ipcRenderer.invoke('i18n', 'Delete').then((title) => { if (title) { deleteBtn.setAttribute('title', title); deleteBtn.setAttribute('aria-label', title); } });
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';

        renameBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // prevent multiple editors
            if (SettingsDiv.querySelector('.folder-edit-wrap')) return;

            // hide action buttons while editing
            actionsWrap.style.display = 'none';

            const editWrap = document.createElement('div');
            editWrap.className = 'folder-edit-wrap';
            editWrap.style.display = 'flex';
            editWrap.style.gap = '0.5rem';
            editWrap.style.alignItems = 'center';

            const input = document.createElement('input');
            input.type = 'text';
            input.value = folderObj.folderName || '';
            input.className = 'form-control form-control-sm';
            input.setAttribute('aria-label', 'Folder name');
            input.style.minWidth = '200px';
            ipcRenderer.invoke('i18n', 'Folder Name').then((text) => { if (text) input.setAttribute('aria-label', text); });

            // only the input is shown; Enter will save, Escape or outside click cancels
            editWrap.appendChild(input);

            folderNameDiv.innerHTML = '';
            folderNameDiv.appendChild(editWrap);
            input.focus();
            input.select();

            const finish = (apply) => {
                const newName = input.value ? input.value.trim() : '';
                if (apply && newName !== '' && newName !== folderObj.folderName) {
                    const ok = favoritesManager.renameFolder(folderObj.folderName, newName);
                    if (ok) {
                        self.folderObj.folderName = newName;
                    }
                }
                // restore header text and actions
                folderNameDiv.innerText = self.folderObj.folderName || 'Folder';
                actionsWrap.style.display = '';
                // re-render detail if rename succeeded and changed
                if (apply && newName !== '' && newName === self.folderObj.folderName) {
                    self.showDetail();
                }
            };

            input.addEventListener('keydown', (ev) => {
                if (ev.key === 'Enter') { ev.preventDefault(); finish(true); }
                if (ev.key === 'Escape') { ev.preventDefault(); finish(false); }
            });

            // click outside to cancel
            const onDocClick = (ev) => {
                if (!folderNameDiv.contains(ev.target) && ev.target !== renameBtn) {
                    finish(false);
                    document.removeEventListener('click', onDocClick);
                }
            };
            setTimeout(() => document.addEventListener('click', onDocClick), 0);
        });

        // delete handler: immediate delete if empty, otherwise show options popup
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // If the folder is empty, delete immediately without confirmation
            if (!Array.isArray(folderObj.items) || folderObj.items.length === 0) {
                favoritesManager.deleteFolder(folderObj.folderName);
                nav.showFavorites();
                return;
            }

            let existing = document.getElementById('folder-ctx-menu');
            if (existing) { existing.remove(); }

            const popup = document.createElement('div');
            popup.id = 'folder-ctx-menu';
            popup.className = 'ctx-menu';
            popup.style.position = 'fixed';
            popup.style.zIndex = 9999;
            // size popup to its contents so it adapts to the text width
            popup.style.display = 'inline-block';
            popup.style.width = 'auto';
            popup.style.minWidth = '220px';
            const rect = deleteBtn.getBoundingClientRect();

            const info = document.createElement('div');

            const moveBtn = document.createElement('div');
            moveBtn.className = 'btn btn-sm btn-outline-primary mb-1';
            moveBtn.style.display = 'block';
            moveBtn.style.width = '100%';
            moveBtn.innerText = 'Move podcasts to top-level';
            ipcRenderer.invoke('i18n', 'Move podcasts to top-level').then((t) => { if (t) moveBtn.innerText = t; });
            moveBtn.onclick = (e2) => {
                e2.stopPropagation();
                // move each podcast to top-level then remove the folder
                try {
                    const items = Array.isArray(folderObj.items) ? folderObj.items.slice() : [];
                    items.forEach(item => {
                        if (item && item.feedUrl) {
                            favoritesManager.movePodcastToRoot(item.feedUrl);
                        }
                    });
                } catch (ex) {
                    console.error('Error moving podcasts to root:', ex);
                }
                favoritesManager.deleteFolder(folderObj.folderName);
                nav.showFavorites();
                popup.remove();
            };

            const delBtn = document.createElement('div');
            delBtn.className = 'btn btn-sm btn-danger mb-1';
            delBtn.style.display = 'block';
            delBtn.style.width = '100%';
            delBtn.innerText = 'Delete podcasts with folder';
            ipcRenderer.invoke('i18n', 'Delete podcasts with folder').then((t) => { if (t) delBtn.innerText = t; });
            delBtn.onclick = (e2) => {
                e2.stopPropagation();
                // simply remove the folder and all contained items
                favoritesManager.deleteFolder(folderObj.folderName);
                nav.showFavorites();
                popup.remove();
            };

            const cancel = document.createElement('div');
            cancel.className = 'btn btn-sm btn-secondary';
            cancel.style.display = 'block';
            cancel.style.width = '100%';
            cancel.innerText = 'Cancel';
            ipcRenderer.invoke('i18n', 'Cancel').then((t) => { if (t) cancel.innerText = t; });
            cancel.onclick = (e2) => { e2.stopPropagation(); popup.remove(); };

            popup.appendChild(info);
            popup.appendChild(moveBtn);
            popup.appendChild(delBtn);
            popup.appendChild(cancel);

            document.body.appendChild(popup);
            setTimeout(() => {
                const popupRect = popup.getBoundingClientRect();
                const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
                const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                let left = rect.right + 8;
                let top = rect.top;

                if (left + popupRect.width > vw - 8) {
                    left = rect.left - popupRect.width - 8;
                }
                if (left < 8) left = 8;
                if (top + popupRect.height > vh - 8) {
                    top = Math.max(8, vh - popupRect.height - 8);
                }

                popup.style.left = left + 'px';
                popup.style.top = top + 'px';

                const onDocClick = (ev) => {
                    if (!popup.contains(ev.target) && ev.target !== deleteBtn) {
                        if (popup && popup.parentElement) popup.remove();
                        document.removeEventListener('click', onDocClick);
                    }
                };
                document.addEventListener('click', onDocClick);
            }, 0);
        });

        const actionsWrap = document.createElement('div');
        actionsWrap.className = 'settings-actions';
        actionsWrap.appendChild(renameBtn);
        actionsWrap.appendChild(deleteBtn);

        SettingsDiv.appendChild(FolderImage);
        SettingsDiv.appendChild(folderNameDiv);
        SettingsDiv.appendChild(CountDiv);
        SettingsDiv.appendChild(actionsWrap);

        List.appendChild(SettingsDiv);

        if (Array.isArray(folderObj.items)) {
            folderObj.items.forEach(item => {
                if (item && item.feedUrl) {
                    const podcast = new Podcast(item);
                    const favEl = podcast.getFavoriteElement();
                    favEl.querySelector('.podcast-entry-header').onclick = function () { window.navAPI.clickPodcast(this); };
                    List.appendChild(favEl);
                }
            });
        }
    }
}
module.exports.FolderUI = FolderUI;
