function darkMode()
{
    const {app} = require('electron').remote

    var ViewMenuItem = app.getApplicationMenu().items[1].submenu

    if(isWindows())
    {
        ViewMenuItem = app.getApplicationMenu().items[0].submenu
    }

    var DarkModeMenu = getDarkModeMenuItem(ViewMenuItem)

    var Stylesheet = document.createElement("link")
    Stylesheet.setAttribute("rel", "stylesheet")
    Stylesheet.setAttribute("href", "./css/dark_layout.css")

    if (DarkModeMenu.checked)
    {
        document.getElementsByTagName("head")[0].append(Stylesheet)
    }
    else
    {
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
    // NOTE: Find the "Dark Mode" menu item in the given parent menu

    var MenuItem = null

    for (var i = 0; i < _ParentMenu.items.length; i++)
    {
        if (_ParentMenu.items[i].label == "Dark Mode" && _ParentMenu.items[i].type == "checkbox")
        {
            MenuItem = _ParentMenu.items[i]
        }
    }

    return MenuItem
}
