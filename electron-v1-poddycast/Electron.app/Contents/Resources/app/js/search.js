function search(_Self, _Event)
{
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
