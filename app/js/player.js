const { BrowserWindow } = require('electron').remote

var CCOntentHelper = require('./js/helper/content')
var CPlayer = require('./js/helper/player')

var helper = new CCOntentHelper()
var player = new CPlayer()


const s_Pause =
`
    <path d="M8 19c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2v10c0 1.1.9 2 2 2zm6-12v10c0 1.1.9 2 2 2s2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2z"/>
`

const s_Play =
`
    <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/>
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

    const mainAppWindow = BrowserWindow.getAllWindows()[0]

    mainAppWindow.setTitle(_Self.getAttribute("title"))
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
    Speedup the plackback by clicking the playback speed-up button.
    The steps to increase the playback is predefined in this function.

    Args:
        _Self (button): The speed up button itself
*/
function speedUp(_Self) {
    var Player = document.getElementById("player")
    const rate = document.querySelector('#content-right-player-speed-indicator')

    switch (rate.innerHTML) {
        case "1.0x": rate.innerHTML = "1.1x"; Player.playbackRate = 1.1; Player.defaultPlaybackRate = 1.1 ; break;
        case "1.1x": rate.innerHTML = "1.2x"; Player.playbackRate = 1.2; Player.defaultPlaybackRate = 1.2 ; break;
        case "1.2x": rate.innerHTML = "1.3x"; Player.playbackRate = 1.3; Player.defaultPlaybackRate = 1.3 ; break;
        case "1.3x": rate.innerHTML = "1.5x"; Player.playbackRate = 1.5; Player.defaultPlaybackRate = 1.5 ; break;
        case "1.5x": rate.innerHTML = "1.7x"; Player.playbackRate = 1.7; Player.defaultPlaybackRate = 1.7 ; break;
        case "1.7x": rate.innerHTML = "2.0x"; Player.playbackRate = 2.0; Player.defaultPlaybackRate = 2.0 ; break;
        case "2.0x": rate.innerHTML = "2.1x"; Player.playbackRate = 2.1; Player.defaultPlaybackRate = 2.1 ; break;
        case "2.1x": rate.innerHTML = "2.2x"; Player.playbackRate = 2.2; Player.defaultPlaybackRate = 2.2 ; break;
        case "2.2x": rate.innerHTML = "2.3x"; Player.playbackRate = 2.3; Player.defaultPlaybackRate = 2.3 ; break;
        case "2.3x": rate.innerHTML = "2.5x"; Player.playbackRate = 2.5; Player.defaultPlaybackRate = 2.5 ; break;
        case "2.5x": rate.innerHTML = "2.7x"; Player.playbackRate = 2.7; Player.defaultPlaybackRate = 2.7 ; break;
        case "2.7x": rate.innerHTML = "3.0x"; Player.playbackRate = 3.0; Player.defaultPlaybackRate = 3.0 ; break;
        case "3.0x": rate.innerHTML = "3.1x"; Player.playbackRate = 3.1; Player.defaultPlaybackRate = 3.1 ; break;
        case "3.1x": rate.innerHTML = "3.2x"; Player.playbackRate = 3.2; Player.defaultPlaybackRate = 3.2 ; break;
        case "3.2x": rate.innerHTML = "3.3x"; Player.playbackRate = 3.3; Player.defaultPlaybackRate = 3.3 ; break;
        case "3.3x": rate.innerHTML = "3.5x"; Player.playbackRate = 3.5; Player.defaultPlaybackRate = 3.5 ; break;
        case "3.5x": rate.innerHTML = "3.7x"; Player.playbackRate = 3.7; Player.defaultPlaybackRate = 3.7 ; break;
        case "3.7x": rate.innerHTML = "4.0x"; Player.playbackRate = 4.0; Player.defaultPlaybackRate = 4.0 ; break;
        case "4.0x": rate.innerHTML = "1.0x"; Player.playbackRate = 1.0; Player.defaultPlaybackRate = 1.0 ; break;
        default: break;
    }
}


/*
    Speeddown the plackback by clicking the playback speed-down button.
    The steps to increase the playback is predefined in this function.

    Args:
        _Self (button): The speed up button itself
*/
function speedDown(_Self) {
    var Player = document.getElementById("player")
    const rate = document.querySelector('#content-right-player-speed-indicator')

    switch (rate.innerHTML) {
        case "4.0x": rate.innerHTML = "3.7x"; Player.playbackRate = 3.7; Player.defaultPlaybackRate = 3.7 ; break;
        case "3.7x": rate.innerHTML = "3.5x"; Player.playbackRate = 3.5; Player.defaultPlaybackRate = 3.5 ; break;
        case "3.5x": rate.innerHTML = "3.3x"; Player.playbackRate = 3.3; Player.defaultPlaybackRate = 3.3 ; break;
        case "3.3x": rate.innerHTML = "3.2x"; Player.playbackRate = 3.2; Player.defaultPlaybackRate = 3.2 ; break;
        case "3.2x": rate.innerHTML = "3.1x"; Player.playbackRate = 3.1; Player.defaultPlaybackRate = 3.1 ; break;
        case "3.1x": rate.innerHTML = "3.0x"; Player.playbackRate = 3.0; Player.defaultPlaybackRate = 3.0 ; break;
        case "3.0x": rate.innerHTML = "2.7x"; Player.playbackRate = 2.7; Player.defaultPlaybackRate = 2.7 ; break;
        case "2.7x": rate.innerHTML = "2.5x"; Player.playbackRate = 2.5; Player.defaultPlaybackRate = 2.5 ; break;
        case "2.5x": rate.innerHTML = "2.3x"; Player.playbackRate = 2.3; Player.defaultPlaybackRate = 2.3 ; break;
        case "2.3x": rate.innerHTML = "2.2x"; Player.playbackRate = 2.2; Player.defaultPlaybackRate = 2.2 ; break;
        case "2.2x": rate.innerHTML = "2.1x"; Player.playbackRate = 2.1; Player.defaultPlaybackRate = 2.1 ; break;
        case "2.1x": rate.innerHTML = "2.0x"; Player.playbackRate = 2.0; Player.defaultPlaybackRate = 2.0 ; break;
        case "2.0x": rate.innerHTML = "1.7x"; Player.playbackRate = 1.7; Player.defaultPlaybackRate = 1.7 ; break;
        case "1.7x": rate.innerHTML = "1.5x"; Player.playbackRate = 1.5; Player.defaultPlaybackRate = 1.5 ; break;
        case "1.5x": rate.innerHTML = "1.3x"; Player.playbackRate = 1.3; Player.defaultPlaybackRate = 1.3 ; break;
        case "1.3x": rate.innerHTML = "1.2x"; Player.playbackRate = 1.2; Player.defaultPlaybackRate = 1.2 ; break;
        case "1.2x": rate.innerHTML = "1.1x"; Player.playbackRate = 1.1; Player.defaultPlaybackRate = 1.1 ; break;
        case "1.1x": rate.innerHTML = "1.0x"; Player.playbackRate = 1.0; Player.defaultPlaybackRate = 1.0 ; break;
        case "1.0x": rate.innerHTML = "4.0x"; Player.playbackRate = 4.0; Player.defaultPlaybackRate = 4.0 ; break;
        default: break;
    }
}

function setSpeedWithWheelMouse(e) {
    if(e.originalEvent.deltaY < 0)
        speedUp();
    else 
        speedDown();
}

function updateProgress()
{
    var Player       = document.getElementById("player")
    var PlayerSource = Player.getElementsByTagName("source")[0]
    const mainAppWindow = BrowserWindow.getAllWindows()[0]

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

    // Update progress bar in taskbar
    mainAppWindow.setProgressBar(Value / 100)
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
        TimeElement.innerHTML = player.getPrettyTime(FullTime.hours) + ":" + player.getPrettyTime(FullTime.minutes) + ":" + player.getPrettyTime(FullTime.seconds)
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

function togglePlayPauseButton() {
    var Player = document.getElementById("player")
    var Button = document.getElementById("play-pause")
    if($('#player source').attr('src')) {
        if (Button.getAttribute("mode") == "play")
            playPlayer();
        else
            pausePlayer();
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

function setSpeed()
{
    var Player = document.getElementById("player")

    if (getPreference('speed') !== 1) {
        Player.playbackRate = parseFloat(getPreference('speed'))
    }
}
