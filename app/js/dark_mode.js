const {Menu} = require('electron').remote

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
        
        if(titlebar != null) {
            const customTitlebar = require('custom-electron-titlebar');
            titlebar.updateBackground(customTitlebar.Color.fromHex('#1c1c1c'));
        }
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

        if(titlebar != null) {
            const customTitlebar = require('custom-electron-titlebar');
            titlebar.updateBackground(customTitlebar.Color.fromHex('#ccc'));
        }
    }
}

function changeThemeMode() {
    var DarkModeMenu = getDarkModeMenuItem()
    DarkModeMenu.checked = !getPreference('darkmode');
}

// ---------------------------------------------------------------------------------------------------------------------

function getDarkModeMenuItem()
{
    // NOTE: Go through all menu items
    // NOTE: Find the "Dark Mode" menu item

    var MenuItem = null;

    for (let i in Menu.getApplicationMenu().items) {
        appMenuItem = Menu.getApplicationMenu().items[i];

        for (let j in appMenuItem.submenu.items) {
            if (appMenuItem.submenu.items[j].label == i18n.__('Dark Mode') && appMenuItem.submenu.items[j].type == "checkbox") {
                MenuItem = appMenuItem.submenu.items[j];
                break;
            }
        }

        if (MenuItem != null)
            break;
    }

    return MenuItem;
}
