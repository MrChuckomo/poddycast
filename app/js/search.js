function search(_Self, _Event)
{
    if (_Event.code == "Enter")
    {
        clearContent()
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

function getPodcastsFromFeed(_SearchTerm)
{
    // http://feeds.feedburner.com/ICO-Radio
    console.log("from feed: " + _SearchTerm);

    makeRequest(_SearchTerm, null, getFeedResults, eRequest.http)
}

function getFeedResults(_Data)
{
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(_Data, "text/xml");

    console.log(xmlDoc);
    console.log(xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("title")[0].innerHTML);
    console.log(xmlDoc.getElementsByTagName("image")[0].getAttribute("href"));
    console.log(xmlDoc.getElementsByTagName("creator")[0].childNodes[0].data);
    console.log(document.getElementById("search-input").value);

    clearContent()

    var List = document.getElementById("list")

    var PodcastInfos = {
        "feedUrl": document.getElementById("search-input").value,
        "artistName": xmlDoc.getElementsByTagName("creator")[0].childNodes[0].data,
        "collectionName": xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("title")[0].innerHTML,
        "artworkUrl30": xmlDoc.getElementsByTagName("image")[0].getAttribute("href"),
        "artworkUrl60": xmlDoc.getElementsByTagName("image")[0].getAttribute("href"),
        "artworkUrl100": xmlDoc.getElementsByTagName("image")[0].getAttribute("href"),
    }

    var Icon = getIcon(PodcastInfos)

    if (isAlreadySaved(PodcastInfos.feedUrl))
    {
        Icon = getFullIcon(PodcastInfos)
    }

    List.append(getPodcastElement(null, PodcastInfos.artworkUrl60, PodcastInfos.artistName, PodcastInfos.collectionName, Icon))
}
