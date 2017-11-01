function selectMenuItem(_Self)
{
    clearSelection()

    _Self.classList.add("selected")

    var Header = document.getElementById("content-right").getElementsByTagName("h1")[0]

    Header.innerHTML = _Self.innerHTML
}

function clearSelection()
{
    Menu = document.getElementById("menu")
    ListItems = Menu.getElementsByTagName("li")

    for (var i = 0; i < ListItems.length; i++)
    {
        ListItems[i].classList.remove("selected")
    }
}
