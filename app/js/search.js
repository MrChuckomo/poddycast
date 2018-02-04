function search(_Self, _Event)
{
    if (_Event.code == "Enter")
    {
        clearContent()
        setHeaderViewAction()
        clearMenuSelection()
        setHeader("Search")

        // console.log(_Self.value);
        // console.log(_Event.code);

        document.getElementById("res").setAttribute("return-value", "")

        if (_Self.value.includes("http") && _Self.value.includes(":") && _Self.value.includes("//"))
        {
            getPodcastsFromFeed(_Self.value)
        }
        else
        {
            getPodcasts(_Self.value)
        }
    }
    else if (_Event.code == "Escape")
    {
        clearTextField(_Self)
    }
}

// ---------------------------------------------------------------------------------------------------------------------

function getPodcastsFromFeed(_SearchTerm)
{
    // http://feeds.feedburner.com/ICO-Radio

    if (isProxySet())
    {
        makeRequest(getFeedProxyOptions(_SearchTerm), null, getFeedResults, eRequest.http)
    }
    else
    {
        if (_SearchTerm.includes("https"))
        {
            makeRequest(_SearchTerm, null, getFeedResults, eRequest.https)
        }
        else
        {
            makeRequest(_SearchTerm, null, getFeedResults, eRequest.http)
        }
    }
}

function getFeedResults(_Data)
{
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(_Data, "text/xml");

    var AllImageTags = xmlDoc.getElementsByTagName("image")
    var Image = null

    if (AllImageTags.length > 0)
    {
        if(AllImageTags[0].nodeName == "itunes:image")
        {
            Image = AllImageTags[0].getAttribute("href")
        }
        else if (AllImageTags[0].nodeName == "image")
        {
            Image = AllImageTags[0].getElementsByTagName("url")[0].innerHTML
        }
    }

    var AllAuthorTags = xmlDoc.getElementsByTagName("author")
    var Author = null

    if (AllAuthorTags.length > 0)
    {
        Author = AllAuthorTags[0].innerHTML
    }
    else
    {
        Author = xmlDoc.getElementsByTagName("creator")[0].childNodes[0].data
    }

    clearContent()

    var List = document.getElementById("list")

    setGridLayout(List, false)

    var PodcastInfos = {
        "feedUrl": document.getElementById("search-input").value,
        "artistName": Author,
        "collectionName": xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("title")[0].innerHTML,
        "artworkUrl30": Image,
        "artworkUrl60": Image,
        "artworkUrl100": Image,
    }

    var Icon = getIcon(PodcastInfos)

    if (isAlreadySaved(PodcastInfos.feedUrl))
    {
        Icon = getFullIcon(PodcastInfos)
    }

    List.append(getPodcastElement(null, PodcastInfos.artworkUrl60, PodcastInfos.artistName, PodcastInfos.collectionName, Icon))
}
