const {app, Menu} = require('electron').remote

const template =
[
    {
        label: 'Edit',
        submenu:
        [
            {role: 'cut'},
            {role: 'copy'},
            {role: 'paste'}
        ]
    },
    {
        label: 'View',
        submenu:
        [
            {role: 'reload'},
            // {role: 'forcereload'},
            {type: 'separator'},
            {role: 'resetzoom'},
            {role: 'zoomin'},
            {role: 'zoomout'},
            {type: 'separator'},
            {
                label: 'Dark Mode',
                type: "checkbox",
                accelerator: "CommandOrControl+Alt+L",
                // checked: false,
                click() { darkMode() }
            },
            {role: 'togglefullscreen'}
        ]
    },
    {
        label: "Player",
        submenu:
        [
            {
                label: "Play/Pause",
                accelerator: "Control+Space",
                click() { playPause("play-pause") }
            },
            {type: 'separator'},
            {
                label: "30sec Reply",
                accelerator: "Left",
                click() { playReply() }
            },
            {
                label: "30sec Forward",
                accelerator: "Right",
                click() { playForward() }
            }
        ]
    },
    {
        label: "Go to",
        submenu:
        [
            {
                label: "Search",
                accelerator: "CommandOrControl+F",
                click() { focusTextField("search-input") }
            },
            {type: 'separator'},
            {
                label: "New Episodes",
                accelerator: "CommandOrControl+1",
                click() { selectMenuItem("menu-episodes"); showNewEpisodes() }
            },
            {
                label: "Favorites",
                accelerator: "CommandOrControl+2",
                click() { selectMenuItem("menu-favorites"); showFavorites() }
            },
            {
                label: "History",
                accelerator: "CommandOrControl+3",
                click() { selectMenuItem("menu-history"); showHistory() }
            },
            {type: 'separator'},
            {
                label: "New List",
                accelerator: "CommandOrControl+N",
                click() { focusTextField("new_list-input") }
            }
        ]
    },
    {
        label: "Settings",
        submenu:
        [
            {
                label: "Proxy Mode",
                type: "checkbox",
                accelerator: "CommandOrControl+Alt+P"
            },
            {type: 'separator'},
            {role: 'toggledevtools'}
        ]
    }
]

if (process.platform === 'darwin')
{
    template.unshift
    ({
        label: app.getName(),
        submenu:
        [
            {role: 'about'},
            {type: 'separator'},
            {role: 'services', submenu: []},
            {type: 'separator'},
            {role: 'hide'},
            {role: 'hideothers'},
            {role: 'unhide'},
            {type: 'separator'},
            {role: 'quit'}
        ]
    })
}

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
