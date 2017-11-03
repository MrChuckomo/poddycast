function search(_Self, _Event)
{
    if (_Event.code == "Enter")
    {
        clearMenuSelection()
        setHeader("Search")

        // console.log(_Self.value);
        // console.log(_Event.code);

        document.getElementById("res").setAttribute("return-value", "")

        getPodcasts(_Self.value)
        // getResults()
    }
    else if (_Event.code == "Escape")
    {
        clearSearchField(_Self)
    }
}

function clearSearchField(_InputField)
{
    _InputField.value = ""
}
