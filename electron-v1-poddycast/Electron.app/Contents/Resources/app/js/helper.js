function clearContent()
{
    // document.getElementById("res").innerHTML = ""
    document.getElementById("list").innerHTML = ""
}

function getPodcastElement(_Artwork, _ArtistName, _CollectioName, _IconElement)
{
    var ListElement = document.createElement("li")
    var ArtistElement = document.createElement("div")
    var CollectionElement = document.createElement("div")
    var EntryBodyElement = document.createElement("div")
    var ImageElement = document.createElement("img")

    ImageElement.src = _Artwork

    ArtistElement.innerHTML = _ArtistName
    ArtistElement.classList.add("podcast-entry-artist")

    CollectionElement.innerHTML = _CollectioName
    CollectionElement.classList.add("podcast-entry-collection")

    EntryBodyElement.classList.add("podcast-entry-body")
    EntryBodyElement.append(CollectionElement)
    EntryBodyElement.append(ArtistElement)

    ListElement.classList.add("podcast-entry")

    if (_IconElement != undefined)
    {
        ListElement.innerHTML = _IconElement
    }

    ListElement.append(ImageElement)
    ListElement.append(EntryBodyElement)

    return ListElement
}
