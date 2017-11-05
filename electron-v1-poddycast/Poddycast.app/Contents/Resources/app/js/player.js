
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

    console.log(_Self);
    console.log(Player);
    console.log(PlayerSource);

    PlayerSource.setAttribute("src", _Self.getAttribute("url"))
    PlayerSource.setAttribute("type", _Self.getAttribute("type"))

    console.log(PlayerSource);

    Player.pause()
    Player.load()
    // Player.play()

    Player.addEventListener("timeupdate", updateProgress, false)

    document.getElementById("content-right-player-img").src = _Self.getElementsByTagName("img")[0].src
    togglePlayPauseButton(document.getElementById("play-pause"))
}

function playPause(_Self)
{
    togglePlayPauseButton(_Self)
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
    var Player = document.getElementById("player")

    // console.log(Player.currentTime);
    // console.log(Player.duration);
    // console.log(Player.ended);
    // console.log(Player.playbackRate);

    // Player.playbackRate = 1.5

    if (Player.ended)
    {
        // TODO: remove from the playlist
        // TODO: add to history
    }

    var Value = 0;

    if (Player.currentTime > 0)
    {
        Value = Math.floor((100 / Player.duration) * Player.currentTime);
    }

    console.log("Progress: " + Value);

    var Progress = document.getElementById("content-right-player-progress-bar-progress")

    Progress.style.width = Value + "%"
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
