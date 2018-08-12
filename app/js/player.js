var CCOntentHelper = require('./js/helper/content')

var helper = new CCOntentHelper()


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

    // NOTE: Set old played episode to delete icon again

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

    // NOTE: Set current episode to play

    selectItem(_Self)

    // NOTE: Set the audio source

    PlayerSource.setAttribute("src", _Self.getAttribute("url"))
    PlayerSource.setAttribute("type", _Self.getAttribute("type"))

    // Player.pause()

    togglePlayPauseButton()

    Player.load()
    Player.currentTime = getPlaybackPosition(_Self.getAttribute("url"))
    Player.addEventListener("timeupdate", updateProgress, false)

    document.getElementById("content-right-player-img").src = _Self.getAttribute("artworkUrl")
    // document.getElementById("content-right-player-title").innerHTML = _Self.getElementsByClassName("podcast-entry-title")[0].innerHTML
    document.getElementById("content-right-player-title").innerHTML = _Self.getAttribute("title")
    // document.getElementById("content-right-player").setAttribute("data-tooltip", _Self.getElementsByClassName("podcast-entry-title")[0].innerHTML)
    togglePlayPauseButton()

    if (player.paused)
    {
        togglePlayPauseButton()
    }
}


/*
    Select a new list item. The current selection is cleared in any case.
    After that set the 'select-episode' class to the list item.

    Args:
        _Self (li): List item to select
*/
function selectItem(_Self)
{
    helper.clearListSelection()

    _Self.classList.add("select-episode")
}


/*
    Pause or continue the playback.
    Function can be called to toggle between play and pause.
*/
function playPause()
{
    document.getElementById("play-pause")

    togglePlayPauseButton()
}


/*
    Access the player and skip foward by 30 sec.
*/
function playForward()
{
    document.getElementById("player").currentTime += 30
}


/*
    Access the player and skip backward by 30 sec.
*/
function playReply()
{
    document.getElementById("player").currentTime -= 30
}


/*
    Speedup the plackback by clicking the playback speed button.
    The steps to increase the playback is predefined in this function.

    Args:
        _Self (button): The speed up button itself
*/
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

    // NOTE: just save every 10 sec.

    if (parseInt(Player.currentTime) % 10 == 0)
    {
        savePlaybackPosition(PlayerSource.getAttribute("src"), Player.currentTime)
    }

    if (Player.ended)
    {
        // TODO: No need to delete it if it's played from the podcast detail view
        deleteFromFile(PlayerSource.getAttribute("src"))
        nextEpisode()
    }

    // NOTE: Update progress bar

    var Value = 0;

    if (Player.currentTime > 0)
    {
        Value = Math.floor((100 / Player.duration) * Player.currentTime)
    }

    var Progress = document.getElementById("content-right-player-progress-bar-progress")

    Progress.style.width = Value + "%"

    // NOTE: Update player time in extended layout

    getFullTime(Player.duration)

    setPlaybackTime(Player.currentTime, "content-right-player-time")
    setPlaybackTime(Player.duration, "content-right-player-duration")
}

function seekProgress(_Self, _Event)
{
    // NOTE: Click position / div element whole width

    var Player = document.getElementById("player")
    var PlayerSource = Player.getElementsByTagName("source")[0]
    var percent = _Event.offsetX / _Self.offsetWidth;

    Player.currentTime = percent * Player.duration;

    savePlaybackPosition(PlayerSource.getAttribute("src"), Player.currentTime)
}


/*
    Automatically start the next episode after the player progress ended.
    Start the next episode and then delete the current item from the list.
    If the current view is not the one where current episode is playing the playback is paused.
*/ 
function nextEpisode()
{
    var AllListItems      = document.getElementsByClassName("list-item-row-layout")
    var SelectedListItems = document.getElementsByClassName("select-episode")

    if (SelectedListItems.length == 1)
    {
        for (var i = 0; i < AllListItems.length; i++)
        {
            var Classes = AllListItems[i].getAttribute("class")

            if (Classes.includes("select-episode") && i < (AllListItems.length - 1))
            {
                playNow(AllListItems[i + 1])

                // NOTE: No need to delete it if it's played from the podcast detail view

                if (document.getElementById('content-right-header').getElementsByTagName('h1')[0].innerHTML != i18n.__('Favorites'))
                {
                    deleteFromListView(AllListItems[i])
                }

                break
            }
            else if (i == (AllListItems.length - 1))
            {
                // NOTE: Currently playling episode is the last item in the list
                // NOTE: No need to delete it if it's played from the podcast detail view

                if (document.getElementById('content-right-header').getElementsByTagName('h1')[0].innerHTML != i18n.__('Favorites')) 
                {
                    deleteFromListView(AllListItems[i])
                }

                pausePlayer()
            }
        }
    }
    else
    {
        // NOTE: Current list is not the one which contains the currently playing episode

        pausePlayer()
    }

    setItemCounts()
}

function setPlaybackTime(_Time, _ElementName)
{
    var TimeElement = document.getElementById(_ElementName)
    var FullTime    = getFullTime(Math.floor(_Time))

    if (!isNaN(FullTime.minutes))
    {
        TimeElement.innerHTML = getPrettyTime(FullTime.hours) + ":" + getPrettyTime(FullTime.minutes) + ":" + getPrettyTime(FullTime.seconds)
    }
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

function togglePlayPauseButton()
{
    var Player = document.getElementById("player")
    var Button = document.getElementById("play-pause")

    if (Button.getAttribute("mode") == "play")
    {
        playPlayer()
    }
    else
    {
        pausePlayer()
    }
}

function playPlayer()
{
    var Button = document.getElementById("play-pause")
    var Player = document.getElementById("player")

    Button.innerHTML = s_Pause
    Button.setAttribute("mode", "pause")

    Player.play()
}

function pausePlayer()
{
    var Button = document.getElementById("play-pause")
    var Player = document.getElementById("player")

    Button.innerHTML = s_Play
    Button.setAttribute("mode", "play")

    Player.pause()
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
