
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
