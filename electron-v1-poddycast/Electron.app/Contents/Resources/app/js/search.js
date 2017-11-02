function search(_Self, _Event)
{
    // TODO: clear menu item selection
    // TODO: set header to "Search"
    // TODO: already subscribed podcast marked with full heart

    if (_Event.code == "Enter")
    {
        // console.log(_Self.value);
        // console.log(_Event.code);

        document.getElementById("res").setAttribute("return-value", "")

        getPodcasts(_Self.value)
        // getResults()
    }
    else if (_Event.code == "Escape")
    {
        _Self.value = ""
    }
}
