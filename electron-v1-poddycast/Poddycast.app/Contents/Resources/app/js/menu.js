function selectMenuItem(_Self)
{
    clearSearchField(document.getElementById("search").getElementsByTagName("input")[0])

    clearMenuSelection()

    _Self.classList.add("selected")

    setHeader(_Self.innerHTML)
}
