'use strict';

const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

const { getPreference, isDarwin, isLinux, isWindows } = require('./js/helper/helper_global');
const opml = require('./js/import_export');
const global = require('./js/helper/helper_global');
const darkMode = require('./js/dark_mode');
const audioPlayer = require('./js/player');
const nav = require('./js/nav');

// Create variables for appIcon, trayIcon, win
// to prevent their removal by garbage collection
let appIcon = null;
let trayIcon = null;
let win;

// Request lock to allow only one instance
// of the app running at the time.
const gotTheLock = app.requestSingleInstanceLock();

// Load proper icon for specific platform
if (isDarwin) {
    trayIcon = path.join(__dirname, './img/poddycast-app_icon-16x16.png');
} else if (isLinux) {
    trayIcon = path.join(__dirname, './img/poddycast-app_icon.png');
} else if (isWindows) {
    trayIcon = path.join(__dirname, './img/poddycast-app_icon.ico');
}

function createWindow() {
    win = new BrowserWindow ({
        height: 600,
        width: 1000,
        icon: trayIcon,
        minHeight: 600,
        minWidth: 1000,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashed: true
    }));

    // Load language file
    const file = path.join(__dirname, 'translations/' + app.getLocale() + '.json');
    const defaultFile = path.join(__dirname, 'translations/en.json');
    const loadedLanguage = JSON.parse(fs.readFileSync((fs.existsSync(file)) ? file : defaultFile), 'utf8');

    function translate(_Phrase) {
        return ((loadedLanguage[_Phrase] === undefined) ? _Phrase : loadedLanguage[_Phrase]);
    }

    console.log(loadedLanguage);

    // Define menu template
    const template = [
        {
            label: translate('Edit'),
            submenu: [
                {
                    role: 'import',
                    label: translate('Import OPML'),
                    click() {
                        opml.import();
                    }
                },
                {
                    role: 'export',
                    label: translate('Export OPML'),
                    click() {
                        opml.export();
                    }
                },
                { type: 'separator' },
                {
                    label: translate('Cut'),
                    role: 'cut'
                },
                {
                    label: translate('Copy'),
                    role: 'copy'
                },
                {
                    label: translate('Paste'),
                    role: 'paste'
                }
            ]
        },
        {
            label: translate('View'),
            submenu: [
                {
                    label: translate('Reload'),
                    role: 'reload'
                },
                { type: 'separator' },
                {
                    label: translate('Reset Zoom'),
                    role: 'resetzoom'
                },
                {
                    label: translate('Zoom In'),
                    role: 'zoomin'
                },
                {
                    label: translate('Zoom Out'),
                    role: 'zoomout'
                },
                { type: 'separator' },
                {
                    label: translate('Color Scheme'),
                    submenu: [
                        {
                            checked: global.getPreference('systemmode', false),
                            click() {
                                darkMode.toggleDarkMode('systemmode');
                            },
                            label: translate('Use system defaults'),
                            type: 'radio'
                        },
                        {
                            accelerator: 'CommandOrControl+Alt+L',
                            checked: global.getPreference('lightmode', false),
                            click() {
                                darkMode.toggleDarkMode('lightmode');
                            },
                            label: translate('Light Mode'),
                            type: 'radio'
                        },
                        {
                            accelerator: 'CommandOrControl+Alt+D',
                            checked: global.getPreference('darkmode', false),
                            click() {
                                darkMode.toggleDarkMode('darkmode');
                            },
                            label: translate('Dark Mode'),
                            type: 'radio'
                        }
                    ]
                },
                { role: 'togglefullscreen', label: translate('Toggle Full Screen') }
            ]
        },
        {
            label: translate('Player'),
            submenu: [
                {
                    accelerator: 'Space',
                    label: translate('Play/Pause'),
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
                    label: translate('30sec Reply'),
                    click() {
                        audioPlayer.playReply();
                    }
                },
                {
                    accelerator: 'Right',
                    label: translate('30sec Forward'),
                    click() {
                        audioPlayer.playForward();
                    }
                },
                { type: 'separator' },
                {
                    accelerator: 'Plus',
                    label: translate('Volume Up'),
                    click() {
                        audioPlayer.increaseVolume(0.05);
                    }
                },
                {
                    accelerator: '-',
                    label: translate('Volume Down'),
                    click() {
                        audioPlayer.decreaseVolume(0.05);
                    }
                }
            ]
        },
        {
            label: translate('Go To'),
            submenu: [
                {
                    accelerator: 'CommandOrControl+F',
                    click() {
                        global.focusTextField('search-input');
                    },
                    label: translate('Search')
                },
                { type: 'separator' },
                {
                    accelerator: 'CommandOrControl+1',
                    click() {
                        nav.selectMenuItem('menu-episodes');
                        nav.showNewEpisodes();
                    },
                    label: translate('New Episodes')
                },
                {
                    accelerator: 'CommandOrControl+2',
                    click() {
                        nav.selectMenuItem('menu-favorites');
                        nav.showFavorites();
                    },
                    label: translate('Favorites')
                },
                {
                    accelerator: 'CommandOrControl+3',
                    click() {
                        nav.selectMenuItem('menu-history');
                        nav.showHistory();
                    },
                    label: translate('History')
                },
                {
                    accelerator: 'CommandOrControl+4',
                    click() {
                        nav.selectMenuItem('menu-statistics');
                        nav.showStatistics();
                    },
                    label: translate('Statistics')
                },
                { type: 'separator' },
                {
                    accelerator: 'CommandOrControl+N',
                    click() {
                        global.focusTextField('new_list-input');
                    },
                    label: translate('New List')
                }
            ]
        },
        {
            label: translate('Settings'),
            submenu: [
                {
                    accelerator: 'CommandOrControl+Alt+P',
                    checked: global.getPreference('proxy_enabled', false),
                    click() {
                        global.toggleProxyMode();
                    },
                    label: translate('Proxy Mode'),
                    type: 'checkbox'
                },
                {
                    accelerator: 'CommandOrControl+Alt+M',
                    checked: global.getPreference('minimize', false),
                    click() {
                        global.toggleMinimize();
                    },
                    label: translate('Minimize'),
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


    // Register some IPC handler
    ipcMain.handle('sys-language', () => {
        return loadedLanguage;
    });

    ipcMain.handle('i18n', async (event, phrase) => {
        return translate(phrase);
    });

    ipcMain.handle('dark-mode:toggle', () => {
        console.log('dark mode toogle');
        return true;
    });

    // Create main menu
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    // Create tray icon
    appIcon = new Tray(trayIcon);

    // Create RightClick context menu for tray icon
    const contextMenu = Menu.buildFromTemplate([
        {
            click: () => {
                win.show();
            },
            label: 'Restore app'
        },
        {
            click: () => {
                win.close();
            },
            label: 'Close app'
        }
    ]);

    // Set title for tray icon
    appIcon.setTitle('Poddycast');

    // Set toot tip for tray icon
    appIcon.setToolTip('Poddycast');

    // Create RightClick context menu
    appIcon.setContextMenu(contextMenu);

    // Always highlight the tray icon - deprecated
    // appIcon.setHighlightMode('always')

    // The tray icon is not destroyed
    appIcon.isDestroyed(false);

    // Restore (open) app after clicking on tray icon
    // if window is already open, minimize it to system tray
    appIcon.on('click', () => {
        win.isVisible() ? win.hide() : win.show();
    });

    win.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });

    // Minimize window to system tray if 'Minimize' option is checked
    if (getPreference('minimize') === true) {
        win.on('minimize', function(event){
            event.preventDefault();
            // win.minimize()
            win.hide();
        });
    }

    // Quit when all windows are closed
    win.on('window-all-closed', () => {
        app.quit();
    });

    win.on('closed', () => {
        app.quit();
    });
}

// Check if this is first instance of the app running.
// If not, block it. If yes, allow it.
if (!gotTheLock) {
    app.quit();
} else {
    // TODO: Resolve this linting warning. We should be able to delete the unused inputs without issue.
    // eslint-disable-next-line no-unused-vars
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (win) {
            if (win.isMinimized()) win.restore();
            win.focus();
        }
    });

    // Create win, load the rest of the app, etc...
    app.on('ready', createWindow);
}

