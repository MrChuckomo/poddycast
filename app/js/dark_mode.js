function darkMode()
{
    const {app} = require('electron').remote

    // NOTE: Currently the "Dark Mode" menu item is located at position 6 in the first menu "View".
    // NOTE: This can change in the future, be aware.

    var DarkModeMenu = app.getApplicationMenu().items[1].submenu.items[6]

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
