function selectMenuItem(_Self)
{
    clearSelection()

    _Self.classList.add("selected")
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
