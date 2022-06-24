'use strict';

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const { getPreference, isDarwin, isLinux, isWindows } = require('./js/helper/helper_global');

// Modules to create app tray icon
const Menu = require('electron').Menu;
const Tray = require('electron').Tray;

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

    let loadedLanguage;
    const file = path.join(__dirname, 'translations/' + app.getLocale() + '.json');

    if (fs.existsSync(file)) {
        loadedLanguage = JSON.parse(fs.readFileSync(file), 'utf8');
    } else {
        loadedLanguage = JSON.parse(fs.readFileSync(path.join(__dirname, 'translations/en.json'), 'utf8'));
    }

    ipcMain.handle('sys-language', () => {
        return loadedLanguage;
    });

    ipcMain.handle('i18n', async (event, phrase) => {
        let translation = loadedLanguage[phrase];

        if (translation === undefined) {
            translation = phrase;
        }

        return translation;
    });

    ipcMain.handle('dark-mode:toggle', () => {
        console.log('dark mode toogle');
        return true;
    });

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
