'use strict';

const { app, Menu } = require('electron').remote;
const opml = require('./js/import_export');
const global = require('./js/helper/helper_global');
const darkMode = require('./js/dark_mode');
const audioPlayer = require('./js/player');
const menujs = require('./js/menu');
const i18n = window.i18n;

const template = [
    {
        label: i18n.__('Edit'),
        submenu: [
            {
                role: 'import',
                label: i18n.__('Import OPML'),
                click() {
                    opml.import();
                }
            },
            {
                role: 'export',
                label: i18n.__('Export OPML'),
                click() {
                    opml.export();
                }
            },
            { type: 'separator' },
            {
                label: i18n.__('Cut'),
                role: 'cut'
            },
            {
                label: i18n.__('Copy'),
                role: 'copy'
            },
            {
                label: i18n.__('Paste'),
                role: 'paste'
            }
        ]
    },
    {
        label: i18n.__('View'),
        submenu: [
            {
                label: i18n.__('Reload'),
                role: 'reload'
            },
            { type: 'separator' },
            {
                label: i18n.__('Reset Zoom'),
                role: 'resetzoom'
            },
            {
                label: i18n.__('Zoom In'),
                role: 'zoomin'
            },
            {
                label: i18n.__('Zoom Out'),
                role: 'zoomout'
            },
            { type: 'separator' },
            {
                label: i18n.__('Color Scheme'),
                submenu: [
                    {
                        checked: global.getPreference('systemmode', false),
                        click() {
                            darkMode.toggleDarkMode('systemmode');
                        },
                        label: i18n.__('Use system defaults'),
                        type: 'radio'
                    },
                    {
                        accelerator: 'CommandOrControl+Alt+L',
                        checked: global.getPreference('lightmode', false),
                        click() {
                            darkMode.toggleDarkMode('lightmode');
                        },
                        label: i18n.__('Light Mode'),
                        type: 'radio'
                    },
                    {
                        accelerator: 'CommandOrControl+Alt+D',
                        checked: global.getPreference('darkmode', false),
                        click() {
                            darkMode.toggleDarkMode('darkmode');
                        },
                        label: i18n.__('Dark Mode'),
                        type: 'radio'
                    }
                ]
            },
            { role: 'togglefullscreen', label: i18n.__('Toggle Full Screen') }
        ]
    },
    {
        label: i18n.__('Player'),
        submenu: [
            {
                accelerator: 'Space',
                label: i18n.__('Play/Pause'),
                click() {
                    // NOTE: if focus is not in any input field (search, playlist)
                    if (document.activeElement.type === undefined) {
                        audioPlayer.togglePlayPauseButton();
                    }
                }
            },
            { type: 'separator' },
            {
                accelerator: 'Left',
                click() {
                    audioPlayer.playReply();
                },
                label: i18n.__('30sec Reply')
            },
            {
                accelerator: 'Right',
                click() {
                    audioPlayer.playForward();
                },
                label: i18n.__('30sec Forward')
            },
            { type: 'separator' },
            {
                accelerator: 'Up',
                // TODO: impement click function
                label: i18n.__('Volume Up')
            },
            {
                accelerator: 'Down',
                // TODO: impement click function
                label: i18n.__('Volume Down')
            }
        ]
    },
    {
        label: i18n.__('Go To'),
        submenu: [
            {
                accelerator: 'CommandOrControl+F',
                click() {
                    global.focusTextField('search-input');
                },
                label: i18n.__('Search')
            },
            { type: 'separator' },
            {
                accelerator: 'CommandOrControl+1',
                click() {
                    menujs.selectMenuItem('menu-episodes');
                    menujs.showNewEpisodes();
                },
                label: i18n.__('New Episodes')
            },
            {
                accelerator: 'CommandOrControl+2',
                click() {
                    menujs.selectMenuItem('menu-favorites');
                    menujs.showFavorites();
                },
                label: i18n.__('Favorites')
            },
            {
                accelerator: 'CommandOrControl+3',
                click() {
                    menujs.selectMenuItem('menu-history');
                    menujs.showHistory();
                },
                label: i18n.__('History')
            },
            {
                accelerator: 'CommandOrControl+4',
                click() {
                    menujs.selectMenuItem('menu-statistics');
                    menujs.showStatistics();
                },
                label: i18n.__('Statistics')
            },
            { type: 'separator' },
            {
                accelerator: 'CommandOrControl+N',
                click() {
                    global.focusTextField('new_list-input');
                },
                label: i18n.__('New List')
            }
        ]
    },
    {
        label: i18n.__('Settings'),
        submenu: [
            {
                accelerator: 'CommandOrControl+Alt+P',
                checked: global.getPreference('proxy_enabled', false),
                click() {
                    global.toggleProxyMode();
                },
                label: i18n.__('Proxy Mode'),
                type: 'checkbox'
            },
            {
                accelerator: 'CommandOrControl+Alt+M',
                checked: global.getPreference('minimize', false),
                click() {
                    global.toggleMinimize();
                },
                label: i18n.__('Minimize'),
                type: 'checkbox'
            },
            { type: 'separator' },
            { role: 'toggledevtools' }
        ]
    }
];

if (process.platform === 'darwin') {
    template.unshift({
        label: app.getName(),
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services', submenu: [] },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    });
}

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
