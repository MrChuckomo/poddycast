
function getInputEntry(_Name)
{
    var InputItem = document.createElement("input")

    InputItem.value = _Name
    InputItem.type = "text"
    InputItem.disabled = true
    InputItem.setAttribute("onfocusout", "clearRenameFocus(this)")
    InputItem.setAttribute("onkeyup", "renamePlaylist(this, event)")


    return InputItem
}

// ---------------------------------------------------------------------------------------------------------------------

function createPlaylist(_Self, _Event)
{
    if (_Event.code == "Enter")
    {
        var NewPlaylist = document.createElement("li")
        NewPlaylist.setAttribute("onclick", "showPlaylistContent(this)")
        NewPlaylist.setAttribute("ondblclick", "enableRename(this)")
        // NewPlaylist.innerHTML = _Self.value
        NewPlaylist.addEventListener('dragenter', handleDragEnter, false);
        NewPlaylist.addEventListener('dragover', handleDragOver, false);
        NewPlaylist.addEventListener('dragleave', handleDragLeave, false);
        NewPlaylist.addEventListener('drop', handleDrop, false);
        NewPlaylist.append(getInputEntry(_Self.value))

        var PlaylistList = document.getElementById("playlists").getElementsByTagName("ul")[0]
        PlaylistList.append(NewPlaylist)

        setContextMenu(NewPlaylist)

        var Playlist =
        {
            "playlistName": _Self.value,
            "podcastList": []
        }

        _Self.innerHTML = s_HeartFilled
        _Self.classList.add("set-favorite")

        var JsonContent = []

        if (fs.existsSync(getPlaylistFilePath()) && fs.readFileSync(getPlaylistFilePath(), "utf-8") != "")
        {
            JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), "utf-8"))
        }
        else
        {
            fs.writeFileSync(getPlaylistFilePath(), JSON.stringify(JsonContent))
        }

        JsonContent.push(Playlist)

        fs.writeFileSync(getPlaylistFilePath(), JSON.stringify(JsonContent))

        clearTextField(_Self)

    }
    else if (_Event.code == "Escape")
    {
        clearTextField(_Self)
    }
}

function loadPlaylists()
{
    var PlaylistList = document.getElementById("playlists").getElementsByTagName("ul")[0]

    if (fs.existsSync(getPlaylistFilePath()) && fs.readFileSync(getPlaylistFilePath(), "utf-8") != "")
    {
        JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), "utf-8"))

        for (var i = 0; i < JsonContent.length; i++)
        {
            var PlaylistEntry = document.createElement("li")
            PlaylistEntry.setAttribute("onclick", "showPlaylistContent(this)")
            PlaylistEntry.setAttribute("ondblclick", "enableRename(this)")
            // PlaylistEntry.innerHTML = JsonContent[i].playlistName
            PlaylistEntry.addEventListener('dragenter', handleDragEnter, false);
            PlaylistEntry.addEventListener('dragover', handleDragOver, false);
            PlaylistEntry.addEventListener('dragleave', handleDragLeave, false);
            PlaylistEntry.addEventListener('drop', handleDrop, false);
            PlaylistEntry.append(getInputEntry(JsonContent[i].playlistName))

            setContextMenu(PlaylistEntry)

            PlaylistList.append(PlaylistEntry)
        }
    }
}

function setContextMenu(_Object)
{
    const {remote}         = require('electron')
    const {Menu, MenuItem} = remote
    const ContextMenu      = new Menu()

    // NOTE: Access input field inside the playlist item to get the name.

    ContextMenu.append(new MenuItem({label: 'Edit', click(self) { showEditPage(_Object) }}))
    ContextMenu.append(new MenuItem({type: 'separator'}))
    ContextMenu.append(new MenuItem({label: 'Rename', click(self) { enableRename(_Object) }}))
    ContextMenu.append(new MenuItem({label: 'Delete', click(self) { deletePlaylist(_Object.getElementsByTagName("input")[0].value) }}))

    _Object.addEventListener('contextmenu', (_Event) =>
    {
        _Event.preventDefault()
        ContextMenu.popup(remote.getCurrentWindow(), { async:true })
    }, false)
}

// ---------------------------------------------------------------------------------------------------------------------

function enableRename(_Self)
{
    var InputField = _Self.getElementsByTagName("input")[0]

    showPlaylistContent(_Self)

    InputField.disabled = false
    InputField.focus()
    InputField.select()
}

function renamePlaylist(_Self, _Event)
{

    if (_Event.code == "Enter")
    {
        if (_Self.classList[0] == "playlist-edit-input")
        {
            renamePlaylistInEdit(_Self)
        }
        else
        {
            renamePlaylistInline(_Self)
        }
    }
}

function getPlaylist(_Name)
{
    // TODO: load podcasts associated with this playlist
}

function isInPlaylist(_PlaylistName, _PodcastName)
{
    var Result      = false
    var JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), "utf-8"))

    for (var i = 0; i < JsonContent.length; i++)
    {
        if (_PlaylistName == JsonContent[i].playlistName)
        {
            for (var j = 0; j < JsonContent[i].podcastList.length; j++)
            {
                if (JsonContent[i].podcastList[j] == _PodcastName)
                {
                    Result = true

                    break
                }
            }
        }
    }

    return Result;
}

function getPodcastEditItem(_Name, _Artwork, _IsSet)
{
    var Container = document.createElement("li")
    var CheckBox  = ((_IsSet) ? s_CheckBox : s_CheckBoxOutline)
    var Artwork   = document.createElement("img")
    var Name      = document.createElement("span")

    // Artwork.src = _Artwork
    Name.innerHTML = _Name

    Container.setAttribute("onclick", "togglePodcast(this)")
    Container.classList.add("podcast-edit-entry")
    Container.innerHTML = CheckBox
    Container.append(Artwork)
    Container.append(Name)

    if (_IsSet) { Container.classList.add("check")   }
    else        { Container.classList.add("uncheck") }

    return Container
}

function togglePodcast(_Self)
{
    var CheckBox = document.createElement("img")
    CheckBox.innerHTML = s_CheckBox

    var CheckBoxOutline = document.createElement("img")
    CheckBoxOutline.innerHTML = s_CheckBoxOutline

    for (var i = 0; i < _Self.classList.length; i++)
    {
        switch (_Self.classList[i])
        {
            case "check":
                _Self.classList.remove("check")
                _Self.classList.add("uncheck")
                _Self.getElementsByTagName("svg")[0].innerHTML = CheckBoxOutline.getElementsByTagName("svg")[0].innerHTML
                removeFromPlaylist(_Self.parentElement.getElementsByClassName("playlist-edit-input")[0].value, _Self.getElementsByTagName("span")[0].innerHTML)

                break;

            case "uncheck":
                _Self.classList.remove("uncheck")
                _Self.classList.add("check")
                _Self.getElementsByTagName("svg")[0].innerHTML = CheckBox.getElementsByTagName("svg")[0].innerHTML
                addToPlaylist(_Self.parentElement.getElementsByClassName("playlist-edit-input")[0].value, _Self.getElementsByTagName("span")[0].innerHTML)

                break;

            default: break;

        }
    }
}

// ---------------------------------------------------------------------------------------------------------------------

function showEditPage(_Self)
{
    var PlaylistName = _Self.getElementsByTagName("input")[0].value
    var List         = document.getElementById("list")

    setGridLayout(List, false)
    clearContent()
    setHeaderViewAction()
    clearMenuSelection()
    clearTextField(document.getElementById("search-input"))
    clearTextField(document.getElementById("new_list-input"))
    setHeader("Edit Playlist")

    _Self.classList.add("selected")

    var NameInput = document.createElement("input")
    NameInput.value = PlaylistName
    NameInput.classList.add("playlist-edit-input")
    NameInput.setAttribute("onkeyup", "renamePlaylist(this, event)")

    var DeleteButton = document.createElement("button")
    DeleteButton.innerHTML = "Delete"
    DeleteButton.setAttribute("onclick", "deletePlaylist('" + PlaylistName + "')")

    var HeaderSection = document.createElement("div")
    HeaderSection.classList.add("edit-header")
    HeaderSection.append(NameInput)
    HeaderSection.append(DeleteButton)

    List.append(HeaderSection)

    List.append(getStatisticsElement("statistics-header", "Linked Podcasts", null))

    var JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))

    JsonContent = sortByName(JsonContent)

    for (var i = 0; i < JsonContent.length; i++)
    {
        List.append(getPodcastEditItem(JsonContent[i].collectionName, JsonContent[i].artworkUrl30, isInPlaylist(PlaylistName, JsonContent[i].collectionName)))
    }
}

function showPlaylistContent(_Self)
{
    var PlaylistName = _Self.getElementsByTagName("input")[0].value

    clearContent()
    setHeaderViewAction()
    clearMenuSelection()
    clearTextField(document.getElementById("search-input"))
    clearTextField(document.getElementById("new_list-input"))

    // TODO: header can be a input field as well for playlists
    // TODO: allow inline editing for playlist header

    // setHeader(_Self.innerHTML)
    setHeader(PlaylistName)

    _Self.classList.add("selected")

    var JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), "utf-8"))

    for (var i = 0; i < JsonContent.length; i++)
    {
        // if (_Self.innerHTML == JsonContent[i].playlistName)
        if (PlaylistName == JsonContent[i].playlistName)
        {
            if (fs.existsSync(getNewEpisodesSaveFilePath()) && fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8") != "")
            {
                var NewEpisodesJsonContent = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8"))
                var List                   = document.getElementById("list")

                setGridLayout(List, false)

                for (var a = 0; a < NewEpisodesJsonContent.length; a++)
                {
                    var Artwork = getValueFromFile(getSaveFilePath, "artworkUrl60", "collectionName", NewEpisodesJsonContent[a].channelName)

                    if (getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", NewEpisodesJsonContent[a].channelName) != undefined && getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", NewEpisodesJsonContent[a].channelName) != "undefined")
                    {
                        Artwork = getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", NewEpisodesJsonContent[a].channelName)
                    }

                    if (Artwork != null)
                    {
                        var ListElement = getPodcastElement(null, Artwork, NewEpisodesJsonContent[a].channelName, NewEpisodesJsonContent[a].episodeTitle, s_DeleteIcon)

                        if (isPlaying(NewEpisodesJsonContent[a].episodeUrl))
                        {
                            ListElement.classList.add("select-episode")
                        }

                        var HeaderElement = ListElement.getElementsByClassName("podcast-entry-header")[0]

                        HeaderElement.setAttribute("onclick", "playNow(this)")
                        HeaderElement.setAttribute("type", NewEpisodesJsonContent[a].episodeType)
                        HeaderElement.setAttribute("url", NewEpisodesJsonContent[a].episodeUrl)
                        HeaderElement.setAttribute("length", NewEpisodesJsonContent[a].episodeLength)
                        HeaderElement.setAttribute("artworkUrl", Artwork)

                        // NOTE: show just episodes of the playlist saved podcast

                        for (var j = 0; j < JsonContent[i].podcastList.length; j++)
                        {
                            if (NewEpisodesJsonContent[a].channelName == JsonContent[i].podcastList[j])
                            {
                                List.append(ListElement)
                                break
                            }
                        }
                    }
                }
            }

            break
        }
    }
}
