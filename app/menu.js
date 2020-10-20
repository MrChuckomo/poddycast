const { app, Menu } = require('electron').remote

const template =
[
	/*
    {
        label: i18n.__('Edit'),
        submenu:
        [
            {role: 'cut', label: i18n.__('Cut')},
            {role: 'copy', label: i18n.__('Copy')},
            {role: 'paste', label: i18n.__('Paste')}
        ]
    },
    */
    {
        label: i18n.__('View'),
        submenu:
        [
            {role: 'reload', label: i18n.__('Reload')},
            // {role: 'forcereload'},
            {type: 'separator'},
            {role: 'resetzoom', label: i18n.__('Reset Zoom')},
            {role: 'zoomin', label: i18n.__('Zoom In'), accelerator: "CommandOrControl+="},
            {role: 'zoomout', label: i18n.__('Zoom Out')},
            {type: 'separator'},
            {
                label: i18n.__('Dark Mode'),
                type: "checkbox",
                accelerator: "CommandOrControl+Shift+L",
                checked: getPreference('darkmode'),
                click() { darkMode() }
            },
            {role: 'togglefullscreen', label: i18n.__('Toggle Full Screen')}
        ]
    },
    {
        label: i18n.__('Player'),
        submenu:
        [
            {
                label: i18n.__('Play/Pause'),
                accelerator: "Space",
                click()
                {
                    // NOTE: if focus is not in any input field (search, playlist)
                    if (document.activeElement.type == undefined)
                    {
                        // console.log(document.activeElement);
                        // console.log(document.activeElement.type);
                        // console.log(Object.prototype.toString.call(document.activeElement));
                        playPause("play-pause")
                    }
                }
            },
            {type: 'separator'},
            {
                label: i18n.__('30sec Reply'),
                accelerator: "Left",
                click() { playReply() }
            },
            {
                label: i18n.__("30sec Forward"),
                accelerator: "Right",
                click() { playForward() }
            }
        ]
    },
    {
        label: i18n.__('Go To'),
        submenu:
        [
            {
                label: i18n.__("Search"),
                accelerator: "CommandOrControl+F",
                click() { focusTextField("search-input") }
            },
            {type: 'separator'},
            {
                label: i18n.__("New Episodes"),
                accelerator: "CommandOrControl+1",
                click() { selectMenuItem("menu-episodes"); showNewEpisodes() }
            },
            {
                label: i18n.__("Favorites"),
                accelerator: "CommandOrControl+2",
                click() { selectMenuItem("menu-favorites"); showFavorites() }
            },
            {
                label: i18n.__("History"),
                accelerator: "CommandOrControl+3",
                click() { selectMenuItem("menu-history"); showHistory() }
            },
            {
                label: i18n.__("Statistics"),
                accelerator: "CommandOrControl+4",
                click() { selectMenuItem("menu-statistics"); showStatistics() }
            },
            {type: 'separator'},
            {
                label: i18n.__("New List"),
                accelerator: "CommandOrControl+N",
                click() { focusTextField("new_list-input") }
            }
        ]
    },
    {
        label: i18n.__('Settings'),
        submenu:
        [
            {
                label: i18n.__("Proxy Mode"),
                type: "checkbox",
                checked: getPreference('proxymode'),
                accelerator: "CommandOrControl+Shift+P",
                click() { setProxyMode() }
            },{
                label: i18n.__("Minimize"),
                type: "checkbox",
                checked: getPreference('minimize'),
                accelerator: "CommandOrControl+Shift+M",
                click() { setMinimize() }
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
