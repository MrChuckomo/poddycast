'use strict';

const { app, BrowserWindow, ipcMain, Menu, Tray, dialog } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

const { getPreference, isDarwin, isLinux, isWindows } = require('./js/helper/helper_global');
const global = require('./js/helper/helper_global');

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
        minWidth: 425,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
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

    // Define menu template
    const template = [
        {
            label: translate('Edit'),
            submenu: [
                {
                    label: translate('Import OPML'),
                    role: 'import',
                    click: () => {
                        let filePath = dialog.showOpenDialogSync(win, {
                            properties: ['openFile'],
                            filters: [{ name: 'OPML', extensions: ['opml'] }]
                        })[0];

                        if (filePath === undefined) {
                            return;
                        }

                        win.webContents.send('trigger-menu', 'menu-opml:import', filePath); // opml.import(win)
                    }
                },
                {
                    label: translate('Export OPML'),
                    role: 'export',
                    click: () => {
                        let filePath = dialog.showSaveDialogSync(win, {
                            filters: [{ name: 'OPML', extensions: ['opml'] }]
                        });

                        if (filePath === undefined) {
                            return;
                        }

                        win.webContents.send('trigger-menu', 'menu-opml:export', filePath); // opml.export(win)

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
                    label: translate('Hide Sidebar'),
                    type: 'checkbox',
                    checked: global.getPreference('hide_sidebar', false),
                    accelerator: 'CommandOrControl+S',
                    click: () => win.webContents.send('trigger-menu', 'menu-sidebar:toggle', 'hide_sidebar')
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
                            label: translate('Use system defaults'),
                            type: 'radio',
                            checked: global.getPreference('systemmode', false),
                            click: () => win.webContents.send('trigger-menu', 'menu-color:system')
                        },
                        {
                            label: translate('Light Mode'),
                            accelerator: 'CommandOrControl+Alt+L',
                            type: 'radio',
                            checked: global.getPreference('lightmode', false),
                            click: () => win.webContents.send('trigger-menu', 'menu-color:light')
                        },
                        {
                            label: translate('Dark Mode'),
                            accelerator: 'CommandOrControl+Alt+D',
                            type: 'radio',
                            checked: global.getPreference('darkmode', false),
                            click: () => win.webContents.send('trigger-menu', 'menu-color:dark')
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
                    label: translate('Play/Pause'),
                    accelerator: 'Space',
                    click: () => win.webContents.send('trigger-menu', 'menu-play-pause')
                },
                { type: 'separator' },
                {
                    label: translate('30sec Reply'),
                    accelerator: 'Left',
                    click: () => win.webContents.send('trigger-menu', 'menu-reply')
                },
                {
                    label: translate('30sec Forward'),
                    accelerator: 'Right',
                    click: () => win.webContents.send('trigger-menu', 'menu-forward')
                },
                { type: 'separator' },
                {
                    label: translate('Volume Up'),
                    accelerator: 'Plus',
                    click: () => win.webContents.send('trigger-menu', 'menu-volume-up')
                },
                {
                    label: translate('Volume Down'),
                    accelerator: '-',
                    click: () => win.webContents.send('trigger-menu', 'menu-volume-down')
                }
            ]
        },
        {
            label: translate('Go To'),
            submenu: [
                {
                    label: translate('Search'),
                    accelerator: 'CommandOrControl+F',
                    click: () => win.webContents.send('trigger-menu', 'menu-search-input')
                },
                { type: 'separator' },
                {
                    label: translate('New Episodes'),
                    accelerator: 'CommandOrControl+1',
                    click: () => win.webContents.send('trigger-menu', 'menu-episodes')
                },
                {
                    label: translate('Favorites'),
                    accelerator: 'CommandOrControl+2',
                    click: () => win.webContents.send('trigger-menu', 'menu-favorites')
                },
                {
                    label: translate('History'),
                    accelerator: 'CommandOrControl+3',
                    click: () => win.webContents.send('trigger-menu', 'menu-history')
                },
                {
                    label: translate('Statistics'),
                    accelerator: 'CommandOrControl+4',
                    click: () => win.webContents.send('trigger-menu', 'menu-statistics')
                },
                { type: 'separator' },
                {
                    label: translate('New List'),
                    accelerator: 'CommandOrControl+N',
                    click: () => win.webContents.send('trigger-menu', 'menu-new_list-input')
                }
            ]
        },
        {
            label: translate('Settings'),
            submenu: [
                {
                    label: translate('Proxy Mode'),
                    accelerator: 'CommandOrControl+Alt+P',
                    type: 'checkbox',
                    checked: global.getPreference('proxy_enabled', false),
                    click: () => win.webContents.send('trigger-menu', 'toggle-property', 'proxy_enabled')
                },
                {
                    label: translate('Minimize'),
                    accelerator: 'CommandOrControl+Alt+M',
                    type: 'checkbox',
                    checked: global.getPreference('minimize', false),
                    click: () => win.webContents.send('trigger-menu', 'toggle-property', 'minimize')
                },
                {
                    label: translate('Track History'),
                    accelerator: 'CommandOrControl+Alt+H',
                    type: 'checkbox',
                    checked: global.getPreference('track_history', true),
                    click: () => win.webContents.send('trigger-menu', 'toggle-property', 'track_history')
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
        return true;
    });

    ipcMain.handle('lang', () => {
        return app.getLocale();
    });

    ipcMain.on('show-ctx-menu-playlist', (event, target) => {
        const template = [
            {
                label: translate('Edit'),
                click: () => event.sender.send('ctx-playlist-command', 'ctx-cmd-edit', target)
            },
            { type: 'separator' },
            {
                label: translate('Rename'),
                click: () => event.sender.send('ctx-playlist-command', 'ctx-cmd-rename', target)
            },
            {
                label: translate('Delete'),
                click: () => event.sender.send('ctx-playlist-command', 'ctx-cmd-delete', target)
            }
        ];
        const menu = Menu.buildFromTemplate(template);
        menu.popup(BrowserWindow.fromWebContents(event.sender));
    });

    ipcMain.on('show-ctx-menu-podcast', (event, target, feedUrl, submenu) => {
        let submenuTemplate = JSON.parse(submenu);

        for (let index = 0; index < submenuTemplate.length; index++) {
            const element = submenuTemplate[index];
            element['click'] = () => event.sender.send('ctx-podcast-command', 'ctx-cmd-add', target, element.label, feedUrl);
        }

        const template = [
            {
                label: translate('Add to playlist'),
                submenu: submenuTemplate
            },
            { type: 'separator' },
            {
                label: translate('Push to New Episodes'),
                type: 'checkbox',
                checked: global.isAddedToInbox(feedUrl),
                click: () => event.sender.send('ctx-podcast-command', 'ctx-cmd-push', target, null, feedUrl)
            },
            { type: 'separator' },
            {
                label: translate('Unsubscribe'),
                click: () => event.sender.send('ctx-podcast-command', 'ctx-cmd-unsubscribe', target, null, feedUrl)
            }
        ];
        const menu = Menu.buildFromTemplate(template);
        menu.popup(BrowserWindow.fromWebContents(event.sender));
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
