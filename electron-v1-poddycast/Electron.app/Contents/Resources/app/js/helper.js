// ---------------------------------------------------------------------------------------------------------------------
// GLOBAL
// ---------------------------------------------------------------------------------------------------------------------
function getSaveFilePath()
{
    return process.env['HOME'] + "/Desktop/poddycast-favorite_podcasts.json"
}

function isAlreadySaved(_FeedUrl)
{
    var JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))
    var FeedExists  = false;

    for (var i = 0; i < JsonContent.length; i ++)
    {
        if (JsonContent[i].feedUrl == _FeedUrl)
        {
            FeedExists = true
            break
        }
    }

    return FeedExists
}

// ---------------------------------------------------------------------------------------------------------------------
// RIGHT COLUMN
// ---------------------------------------------------------------------------------------------------------------------

function clearContent()
{
    // document.getElementById("res").innerHTML = ""
    document.getElementById("list").innerHTML = ""
}

function setHeader(_Title)
{
    var Header = document.getElementById("content-right").getElementsByTagName("h1")[0]

    Header.innerHTML = _Title
}

// ---------------------------------------------------------------------------------------------------------------------
// PODCAST ENTRY
// ---------------------------------------------------------------------------------------------------------------------

function getPodcastElement(_Artwork, _ArtistName, _CollectioName, _IconElement)
{
    var ListElement       = document.createElement("li")
    var ArtistElement     = document.createElement("div")
    var CollectionElement = document.createElement("div")
    var EntryBodyElement  = document.createElement("div")
    var ImageElement      = document.createElement("img")

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

// ---------------------------------------------------------------------------------------------------------------------
// MENU
// ---------------------------------------------------------------------------------------------------------------------

function clearMenuSelection()
{
    Menu = document.getElementById("menu")
    ListItems = Menu.getElementsByTagName("li")

    for (var i = 0; i < ListItems.length; i++)
    {
        ListItems[i].classList.remove("selected")
    }
}
