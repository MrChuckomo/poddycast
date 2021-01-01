'use strict'

const {app, Menu} = require('electron').remote

// ---------------------------------------------------------------------------------------------------------------------

function darkMode()
{
    var DarkModeMenu = getDarkModeMenuItem()

    var Stylesheet = document.createElement("link")
    Stylesheet.setAttribute("rel", "stylesheet")
    Stylesheet.setAttribute("href", "./css/dark_layout.css")

    if (DarkModeMenu.checked)
    {
        setPreference('darkmode', true)

        document.getElementsByTagName("head")[0].append(Stylesheet)
    }
    else
    {
        setPreference('darkmode', false)

        var Links = document.getElementsByTagName("head")[0].getElementsByTagName("link")

        for (var i = 0; i < Links.length; i++)
        {
            if (Links[i].getAttribute("href").includes("dark_layout"))
            {
                Links[i].parentElement.removeChild(Links[i])

                break
            }
        }
    }
}

// ---------------------------------------------------------------------------------------------------------------------

function getDarkModeMenuItem(_ParentMenu)
{
    // NOTE: Go through all menu items
    // NOTE: Find the "Dark Mode" menu item

    var MenuItem = null

    for (var i = 0; i < Menu.getApplicationMenu().items.length; i++)
    {
        var appMenuItem = Menu.getApplicationMenu().items[i]

        for (var j = 0; j < appMenuItem.submenu.items.length; j++)
        {
            if (appMenuItem.submenu.items[j].label == i18n.__('Dark Mode') && appMenuItem.submenu.items[j].type == "checkbox")
            {
                MenuItem = appMenuItem.submenu.items[j]

                break
            }
        }

        if (MenuItem != null)
        {
            break
        }
    }

    return MenuItem
}
