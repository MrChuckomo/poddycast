// ---------------------------------------------------------------------------------------------------------------------
// LEFT COLUMN
// ---------------------------------------------------------------------------------------------------------------------

function setItemCounts()
{
    var NewEpisodesCount       = document.getElementById("menu-episodes").getElementsByClassName("menu-count")[0]

    if (fs.existsSync(getPlaylistFilePath()) && fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8") != "")
    {
        NewEpisodesCount.innerHTML = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8")).length
    }
    else
    {
        NewEpisodesCount.innerHTML = 0
    }

    var FavoritesCount       = document.getElementById("menu-favorites").getElementsByClassName("menu-count")[0]

    if (fs.existsSync(getPlaylistFilePath()) && fs.readFileSync(getSaveFilePath(), "utf-8") != "")
    {
        FavoritesCount.innerHTML = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8")).length
    }
    else
    {
        FavoritesCount.innerHTML = 0
    }
}

function clearPlaylists()
{
    var AllInputFields = document.getElementById("playlists").getElementsByTagName("input")

    for (var i = 0; i < AllInputFields.length; i++)
    {
        if (!AllInputFields[i].disabled)
        {
            clearRenameFocus(AllInputFields[i])
        }
    }
}
/*
function clearRenameFocus(_Self)
{
    
    if (_Self.value == "")
    {
        var HeaderName = document.getElementById("content-right-header").getElementsByTagName("h1")[0].innerHTML

        _Self.value = HeaderName
    }

    renamePlaylistInline(_Self)
}

function renamePlaylistInline(_Self)
{
    if (_Self.value != null && _Self.value != "")
    {
        var HeaderName = document.getElementById("content-right-header").getElementsByTagName("h1")[0].innerHTML
        var NewName = _Self.value

        setPlaylistName(HeaderName, NewName)
        showPlaylistContent(_Self.parentElement)

        _Self.disabled = true
    }
}

function renamePlaylistInEdit(_Self)
{
    if (_Self.value != null && _Self.value != "")
    {
        var SelectionName = document.getElementById("playlists").getElementsByClassName("selected")[0].getElementsByTagName("input")[0].value
        var NewName = _Self.value

        setPlaylistName(SelectionName, NewName)
        document.getElementById("playlists").getElementsByClassName("selected")[0].getElementsByTagName("input")[0].value = NewName

        console.log(_Self.parentElement.getElementsByTagName("button")[0].getAttribute("onclick"));

        _Self.parentElement.getElementsByTagName("button")[0].setAttribute("onclick", "deletePlaylist('" + NewName + "')")

        console.log(_Self.parentElement.getElementsByTagName("button")[0].getAttribute("onclick"));
    }
}
*/
function setPlaylistName(_OldName, _NewName)
{
    if (fs.existsSync(getPlaylistFilePath()) && fs.readFileSync(getPlaylistFilePath(), "utf-8") != "")
    {
        JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), "utf-8"))

        for (var i = 0; i < JsonContent.length; i++)
        {
            if (JsonContent[i].playlistName == _OldName)
            {
                JsonContent[i].playlistName = _NewName

                break
            }
        }

        fs.writeFileSync(getPlaylistFilePath(), JSON.stringify(JsonContent))
    }
}

function setGridLayout(_List, _Enable)
{
    if (_Enable)
    {
        _List.classList.add("grid-layout")
        // _List.style.display = "grid"
        // _List.style.gridTemplateColumns = "1fr 1fr 1fr"
    }
    else
    {
        _List.classList.remove("grid-layout")
        // _List.style.display = null
        // _List.style.gridTemplateColumns = null
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// RIGHT COLUMN
// ---------------------------------------------------------------------------------------------------------------------

function setHeaderViewAction(_Mode)
{
    switch (_Mode)
    {
        case "list":
            document.getElementById("content-right-header-actions").innerHTML = s_ListView
            document.getElementById("content-right-header-actions").getElementsByTagName("svg")[0].setAttribute("onclick", "toggleList('list')")
            break;

        case "grid":
            document.getElementById("content-right-header-actions").innerHTML = s_GridView
            document.getElementById("content-right-header-actions").getElementsByTagName("svg")[0].setAttribute("onclick", "toggleList('grid')")
            break;

        default: document.getElementById("content-right-header-actions").innerHTML = ""; break;
    }
}

function toggleList(_View)
{
    switch (_View)
    {
        case "list":
            var List = document.getElementById("list")
            setGridLayout(List, false)
            setHeaderViewAction("grid")
            break;

        case "grid":
            var List = document.getElementById("list")
            setGridLayout(List, true)
            setHeaderViewAction("list")
            break;

        default: break;
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// MENU & PLAYLISTS
// ---------------------------------------------------------------------------------------------------------------------

function clearMenuSelection()
{
    var Menu      = document.getElementById("menu")
    var ListItems = Menu.getElementsByTagName("li")
    var Playlists = document.getElementById("playlists").getElementsByTagName("li")

    for (var i = 0; i < ListItems.length; i++)
    {
        ListItems[i].classList.remove("selected")
    }

    for (var i = 0; i < Playlists.length; i++)
    {
        Playlists[i].classList.remove("selected")
    }
}


function dragToPlaylist(_PlaylistName, _PodcastName)
{
    addToPlaylist(_PlaylistName, _PodcastName)
}

function addToPlaylist(_PlaylistName, _PodcastName)
{
    /*
    var JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), "utf-8"))

    for (var i = 0; i < JsonContent.length; i++)
    {
        if (JsonContent[i].playlistName == _PlaylistName)
        {
            var PodcastList = JsonContent[i].podcastList

            if (!isAlreadyInPlaylist(_PlaylistName, _PodcastName))
            {
                PodcastList.push(_PodcastName)
            }

            break
        }
    }

    fs.writeFileSync(getPlaylistFilePath(), JSON.stringify(JsonContent))
    */
    allPlaylist.memory.addPodcastByName(_PlaylistName, _PodcastName);
}

function removeFromPlaylist(_PlaylistName, _PodcastName)
{
    /*
    var JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), "utf-8"))

    for (var i = 0; i < JsonContent.length; i++)
    {
        if (JsonContent[i].playlistName == _PlaylistName)
        {
            var PodcastList = JsonContent[i].podcastList

            if (isAlreadyInPlaylist(_PlaylistName, _PodcastName))
            {
                for (var j = PodcastList.length - 1; j >= 0 ; j--)
                {
                    if(PodcastList[j] == _PodcastName) { PodcastList.splice(j, 1) }
                }
            }

            break
        }
    }

    fs.writeFileSync(getPlaylistFilePath(), JSON.stringify(JsonContent))
    */
    allPlaylist.memory.removePodcastByName(_PlaylistName, _PodcastName);
}
/*
function deletePlaylist(_PlaylistName)
{
    var JsonContent  = JSON.parse(fs.readFileSync(getPlaylistFilePath(), "utf-8"))

    for (var i = 0; i < JsonContent.length; i++)
    {
        if (_PlaylistName == JsonContent[i].playlistName)
        {
            JsonContent.splice(i, 1)
            break
        }
    }

    fs.writeFileSync(getPlaylistFilePath(), JSON.stringify(JsonContent))

    // TODO: clean remove
    // TODO: do not simply reload the whole app

    //location.reload()

    // functions of the menu.js file
    
    let title = document.getElementById("content-right").getElementsByTagName("h1")[0].innerHTML
    if(title == _PlaylistName || title == '<span>' +  i18n.__("Edit Playlist" + '</span>')) {
        selectMenuItem('menu-episodes')
        showNewEpisodes()
    } else if(title == '<span>' + i18n.__("Statistics") + '</span>') {
        selectMenuItem('menu-statistics')
        showStatistics()
    }
}
*/