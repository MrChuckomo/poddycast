const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')

// Import getPreference() helper function
const getPreference = require('./js/helper/helper_global')

// Modules to create app tray icon
const Menu = require('electron').Menu
const Tray = require('electron').Tray

// Create variables for appIcon, trayIcon, win
// to prevent their removal by garbage collection
let appIcon = null
let trayIcon = null
let win

// Request lock to allow only one instance
// of the app running at the time.
const gotTheLock = app.requestSingleInstanceLock()

// Load proper icon for specific platform
if (process.platform === 'darwin' || process.platform === 'linux') {
    trayIcon = path.join(__dirname, './img/poddycast-app_icon.png')
} else if (process.platform == 'win32') {
    trayIcon = path.join(__dirname, './img/poddycast-app_icon.ico')
}

function createWindow()
{
    win = new BrowserWindow
    ({
        width: 1000,
        minWidth: 1000,
        height: 600,
        minHeight: 600,
        autoHideMenuBar: true,
        icon: trayIcon
    })
    
    menuBarVisibility = false
    win.webContents.on("before-input-event", (event, input) => { 
	    if(input.alt) {
	        win.setMenuBarVisibility(menuBarVisibility)
	        menuBarVisibility = !menuBarVisibility
	    }
	})
    
	win.setMenuBarVisibility(false)

    win.loadURL(url.format
    ({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashed: true
    }))

    // Create tray icon
    appIcon = new Tray(trayIcon)

    // Create RightClick context menu for tray icon
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Restore app',
            click: () => {
                win.show()
            }
        },
        {
            label: 'Close app',
            click: () => {
                win.close()
            }
        }
    ])

    // Set title for tray icon
    appIcon.setTitle('Poddycast')

    // Set toot tip for tray icon
    appIcon.setToolTip('Poddycast')

    // Create RightClick context menu
    appIcon.setContextMenu(contextMenu)

    // Always highlight the tray icon
    appIcon.setHighlightMode('always')

    // The tray icon is not destroyed
    appIcon.isDestroyed(false)

    // Restore (open) app after clicking on tray icon
    // if window is already open, minimize it to system tray
    appIcon.on('click', () => {
        win.isVisible() ? win.hide() : win.show()
    })

    win.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })

    // Minimize window to system tray if 'Minimize' option is checked
    if (getPreference('minimize') === true) {
        win.on('minimize', function(event){
            event.preventDefault()
            // win.minimize()
            win.hide()
        })
    }

    // Quit when all windows are closed
    win.on('window-all-closed', () =>
    {
        app.quit()
    })

    win.on('closed', () =>
    {
        app.quit()
    })
}

// Check if this is first instance of the app running.
// If not, block it. If yes, allow it.
if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (win) {
            if (win.isMinimized()) win.restore()
                win.focus()
        }
    })

    // Create win, load the rest of the app, etc...
    app.on('ready', createWindow)
}
