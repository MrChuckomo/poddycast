
function createPlaylist(_Self, _Event)
{
    if (_Event.code == "Enter")
    {
        var NewPlaylist = document.createElement("li")
        NewPlaylist.innerHTML = _Self.value

        var PlaylistList = document.getElementById("playlists").getElementsByTagName("ul")[0]
        PlaylistList.append(NewPlaylist)

        setContextMenu(NewPlaylist)

        var Playlist =
        {
            "playlistName": _Self.value
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
            PlaylistEntry.innerHTML = JsonContent[i].playlistName

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

    ContextMenu.append(new MenuItem({label: 'Remove Playlist: ' + _Object.innerHTML, click(self)
    {
        console.log(self.label)

        var PlaylistName = self.label.replace("Remove Playlist: ", "")

        console.log(PlaylistName);

        var JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), "utf-8"))

        for (var i = 0; i < JsonContent.length; i++)
        {
            if (PlaylistName == JsonContent[i].playlistName)
            {
                console.log("found playlist");

                JsonContent.splice(i, 1)
                break
            }
        }

        fs.writeFileSync(getPlaylistFilePath(), JSON.stringify(JsonContent))

        location.reload()
    }}))

    _Object.addEventListener('contextmenu', (_Event) =>
    {
        _Event.preventDefault()
        ContextMenu.popup(remote.getCurrentWindow())
    }, false)
}

function getPlaylist(_Name)
{
    // TODO: load podcasts associated with this playlist
}
