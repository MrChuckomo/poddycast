
const s_Pause =
`
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
`

const s_Play =
`
    <path d="M8 5v14l11-7z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
`

// ---------------------------------------------------------------------------------------------------------------------

function playNow(_Self)
{
    var Player = document.getElementById("player")
    var PlayerSource = Player.getElementsByTagName("source")[0]

    // console.log(_Self);
    // console.log(Player);
    // console.log(PlayerSource);

    // Set old played episode to delete icon again

    var FeedUrl = PlayerSource.getAttribute("src")
    var AllListItems = document.getElementsByClassName("podcast-entry")

    for (var i = 0; i < AllListItems.length; i++)
    {
        if (AllListItems[i].getAttribute("url") == FeedUrl)
        {
            AllListItems[i].getElementsByTagName("svg")[0].innerHTML = s_Delete
            // AllListItems[i].getElementsByTagName("svg")[0].innerHTML = s_Delete
            break
        }
    }

    // Set current episode icon to play

    if (_Self.getElementsByTagName("svg").length == 0)
    {
        // TODO: show a svg if nothing is there (add, append etc.)
        // _Self.innerHTML = s_PlayIcon
    }
    else
    {
        _Self.getElementsByTagName("svg")[0].innerHTML = s_Play
    }


    // Set the audio source

    PlayerSource.setAttribute("src", _Self.getAttribute("url"))
    PlayerSource.setAttribute("type", _Self.getAttribute("type"))

    // console.log(PlayerSource);

    // Player.pause()

    togglePlayPauseButton(document.getElementById("play-pause"))

    Player.load()
    // Player.play()

    Player.currentTime = getPlaybackPosition(_Self.getAttribute("url"))

    // console.log(getPlaybackPosition(_Self.getAttribute("url")));

    Player.addEventListener("timeupdate", updateProgress, false)

    document.getElementById("content-right-player-img").src = _Self.getAttribute("artworkUrl")
    togglePlayPauseButton(document.getElementById("play-pause"))

    if (player.paused)
    {
        togglePlayPauseButton(document.getElementById("play-pause"))
    }
}

function playPause()
{
    document.getElementById("play-pause")

    togglePlayPauseButton(document.getElementById("play-pause"))
}

function playForward()
{
    document.getElementById("player").currentTime += 30
}

function playReply()
{
    document.getElementById("player").currentTime -= 30
}

function speedUp(_Self)
{
    var Player = document.getElementById("player")

    switch (_Self.innerHTML)
    {
        case "1.0x": _Self.innerHTML = "1.1x"; Player.playbackRate = 1.1; Player.defaultPlaybackRate = 1.1 ; break;
        case "1.1x": _Self.innerHTML = "1.2x"; Player.playbackRate = 1.2; Player.defaultPlaybackRate = 1.2 ; break;
        case "1.2x": _Self.innerHTML = "1.3x"; Player.playbackRate = 1.3; Player.defaultPlaybackRate = 1.3 ; break;
        case "1.3x": _Self.innerHTML = "1.5x"; Player.playbackRate = 1.5; Player.defaultPlaybackRate = 1.5 ; break;
        case "1.5x": _Self.innerHTML = "1.7x"; Player.playbackRate = 1.7; Player.defaultPlaybackRate = 1.7 ; break;
        case "1.7x": _Self.innerHTML = "2.0x"; Player.playbackRate = 2.0; Player.defaultPlaybackRate = 2.0 ; break;
        case "2.0x": _Self.innerHTML = "1.0x"; Player.playbackRate = 1.0; Player.defaultPlaybackRate = 1.0 ; break;
        default: break;
    }
}

function updateProgress()
{
    var Player       = document.getElementById("player")
    var PlayerSource = Player.getElementsByTagName("source")[0]

    // TODO: just save every 10 sec.

    if (parseInt(Player.currentTime) % 10 == 0)
    {
        savePlaybackPosition(PlayerSource.getAttribute("src"), Player.currentTime)
    }

    // console.log(Player.currentTime);
    // console.log(Player.duration);
    // console.log(Player.ended);
    // console.log(Player.playbackRate);
    // Player.playbackRate = 1.5

    if (Player.ended)
    {
        deleteFromFile(PlayerSource.getAttribute("src"))

        // TODO: play next episode in line depending on the playlist
    }

    var Value = 0;

    if (Player.currentTime > 0)
    {
        Value = Math.floor((100 / Player.duration) * Player.currentTime);
    }

    // console.log("Progress: " + Value);

    var Progress = document.getElementById("content-right-player-progress-bar-progress")

    Progress.style.width = Value + "%"
}

function savePlaybackPosition(_Source, _CurrentTime)
{
    if (fs.existsSync(getNewEpisodesSaveFilePath()) && fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8"))

        for (var i = 0; i < JsonContent.length; i++)
        {
            if (JsonContent[i].episodeUrl == _Source)
            {
                JsonContent[i].playbackPosition = _CurrentTime

                // console.log(JsonContent[i].playbackPosition);
                // console.log(_CurrentTime);

                fs.writeFileSync(getNewEpisodesSaveFilePath(), JSON.stringify(JsonContent))

                break
            }
        }
    }
}

function togglePlayPauseButton(_Button)
{
    var Player = document.getElementById("player")

    if (_Button.getAttribute("mode") == "play")
    {
        _Button.innerHTML = s_Pause
        _Button.setAttribute("mode", "pause")

        Player.play()
    }
    else
    {
        _Button.innerHTML = s_Play
        _Button.setAttribute("mode", "play")

        Player.pause()
    }
}

function getPlaybackPosition(_Source)
{
    var PlaybackPosition = 0

    if (fs.existsSync(getNewEpisodesSaveFilePath()) && fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8") != "")
    {
        var JsonContent = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8"))

        for (var i = 0; i < JsonContent.length; i++)
        {
            if (JsonContent[i].episodeUrl == _Source)
            {
                PlaybackPosition = JsonContent[i].playbackPosition

                break
            }
        }
    }

    return PlaybackPosition
}
