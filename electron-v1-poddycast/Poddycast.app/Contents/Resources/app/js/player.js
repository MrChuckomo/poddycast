
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
    Player.play()

    // console.log(_Self.getElementsByTagName("img")[0].src);

    // document.getElementById("content-right-player-img").src = _Self.getElementsByTagName("img")[0].src
}

function playPause(_Self)
{
    togglePlayPauseButton(_Self)
}

function togglePlayPauseButton(_Button)
{
    if (_Button.getAttribute("mode") == "play")
    {
        _Button.innerHTML = s_Pause
        _Button.setAttribute("mode", "pause")
    }
    else
    {
        _Button.innerHTML = s_Play
        _Button.setAttribute("mode", "play")
    }
}
