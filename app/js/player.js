const { BrowserWindow } = require('electron').remote

var CCOntentHelper = require('./js/helper/content')
var CPlayer = require('./js/helper/player')

var helper = new CCOntentHelper()
var player = new CPlayer()

function playNow(_Self)
{
    var Player = document.getElementById("player")
    var PlayerSource = Player.getElementsByTagName("source")[0]

    // NOTE: Set old played episode to delete icon again
    /*
    var FeedUrl = PlayerSource.getAttribute("src")
    var AllListItems = document.getElementsByClassName("podcast-entry")
    
    for (var i = 0; i < AllListItems.length; i++)
    {
        if (AllListItems[i].getAttribute("url") == FeedUrl)
        {
            AllListItems[i].getElementsByTagName("svg")[0].innerHTML = $(s_DeleteIcon).html()
            // AllListItems[i].getElementsByTagName("svg")[0].innerHTML = s_Delete
            break
        }
    }
    */
    removeInitialOpacityPlayerButtons()

    // NOTE: Set current episode to play

    selectItem(_Self)

    // NOTE: Set the audio source
    
    PlayerSource.setAttribute("channel", _Self.getAttribute("channel"))
    PlayerSource.setAttribute("feedUrl", _Self.getAttribute("feedUrl"))
    PlayerSource.setAttribute("src", _Self.getAttribute("url"))
    PlayerSource.setAttribute("type", _Self.getAttribute("type"))

    // Player.pause()

    togglePlayPauseButton()

    Player.load()
    Player.currentTime = getPlaybackPosition(_Self.getAttribute("feedUrl"), _Self.getAttribute("url"))
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

    setTitle(_Self.getAttribute("title"))
    playPlayer()
    setNavigator(_Self.getAttribute("title"), 
                 _Self.getAttribute("channel"), 
                 _Self.getAttribute("pubDate"), 
                 _Self.getAttribute("artworkUrl"));
}

function setNavigator(title, artist, album, artwork) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: title,
            artist: artist,
            album: album,
            artwork: [
                {
                    src: artwork,
                    sizes: '512x512',
                    type: 'image/jpg'
                },
                {
                    src: 'img/generic_podcast_image.png',
                    sizes: '256x256',
                    type: 'image/png'
                }
            ]
        });

        navigator.mediaSession.setActionHandler('play', async function () {
            console.log('> User clicked "Play" icon.');
            playPlayer();
            // Do something more than just playing audio...
        });

        navigator.mediaSession.setActionHandler('pause', function () {
            console.log('> User clicked "Pause" icon.');
            pausePlayer();
            // Do something more than just pausing audio...
        });

        navigator.mediaSession.setActionHandler("previoustrack", (details) => {
            // const skipTime = details.seekOffset || defaultSkipTime;
            // video.currentTime = Math.max(video.currentTime - skipTime, 0);
            // TODO: Update playback state.
            playReply()
        });

        navigator.mediaSession.setActionHandler("nexttrack", (details) => {
            // const skipTime = details.seekOffset || defaultSkipTime;
            // video.currentTime = Math.min(video.currentTime + skipTime, video.duration);
            // TODO: Update playback state.
            playForward()
        });
    }
}

function setInitialOpacityPlayerButtons() {
    $('#replay-30-sec').css('opacity', 0.4);
    $('#play-pause').css('opacity', 0.4);
    $('#forward-30-sec').css('opacity', 0.4);
    $('#content-right-player-img').css('opacity', 0.6);
}

function removeInitialOpacityPlayerButtons() {
    $('#replay-30-sec').removeAttr('style');
    $('#play-pause').removeAttr('style');
    $('#forward-30-sec').removeAttr('style');
    $('#content-right-player-img').removeAttr('style');
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

function playerIsSet() {
    return Boolean($('#player source').attr('src'));
}
 
/*
    Access the player and skip foward by 30 sec.
*/
function playForward() {
    if(playerIsSet()) {
        document.getElementById("player").currentTime += 30
        $('#forward-30-sec').animateRotate(360, 900)
    }
}


/*
    Access the player and skip backward by 30 sec.
*/
function playReply() {
    if(playerIsSet()) {
        document.getElementById("player").currentTime -= 30
        $('#replay-30-sec').animateRotate(-360, 900)
    }
}

/*
function playForward() {
    document.getElementById("player").currentTime += 30
}

function playReply() {
    document.getElementById("player").currentTime -= 30
}
*/


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
        case "0.5x": rate.innerHTML = "0.6x"; Player.playbackRate = 0.6; Player.defaultPlaybackRate = 0.6 ; break;
        case "0.6x": rate.innerHTML = "0.7x"; Player.playbackRate = 0.7; Player.defaultPlaybackRate = 0.7 ; break;
        case "0.7x": rate.innerHTML = "0.8x"; Player.playbackRate = 0.8; Player.defaultPlaybackRate = 0.8 ; break;
        case "0.8x": rate.innerHTML = "0.9x"; Player.playbackRate = 0.9; Player.defaultPlaybackRate = 0.9 ; break;
        case "0.9x": rate.innerHTML = "1.0x"; Player.playbackRate = 1.0; Player.defaultPlaybackRate = 1.0 ; break;
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
        case "4.0x": rate.innerHTML = "0.5x"; Player.playbackRate = 0.5; Player.defaultPlaybackRate = 0.5 ; break;
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
        case "1.0x": rate.innerHTML = "0.9x"; Player.playbackRate = 0.9; Player.defaultPlaybackRate = 0.9 ; break;
        case "0.9x": rate.innerHTML = "0.8x"; Player.playbackRate = 0.8; Player.defaultPlaybackRate = 0.8 ; break;
        case "0.8x": rate.innerHTML = "0.7x"; Player.playbackRate = 0.7; Player.defaultPlaybackRate = 0.7 ; break;
        case "0.7x": rate.innerHTML = "0.6x"; Player.playbackRate = 0.6; Player.defaultPlaybackRate = 0.6 ; break;
        case "0.6x": rate.innerHTML = "0.5x"; Player.playbackRate = 0.5; Player.defaultPlaybackRate = 0.5 ; break;
        case "0.5x": rate.innerHTML = "4.0x"; Player.playbackRate = 4.0; Player.defaultPlaybackRate = 4.0 ; break;
        
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
        savePlaybackPosition(PlayerSource.getAttribute("feedUrl"), PlayerSource.getAttribute("src"), Player.currentTime)
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
    //mainAppWindow.setProgressBar(Value / 100)
}

function seekProgress(_Self, _Event)
{
    // NOTE: Click position / div element whole width

    var Player = document.getElementById("player")
    var PlayerSource = Player.getElementsByTagName("source")[0]
    var percent = _Event.offsetX / _Self.offsetWidth;

    Player.currentTime = percent * Player.duration;

    savePlaybackPosition(PlayerSource.getAttribute("feedUrl"), PlayerSource.getAttribute("src"), Player.currentTime)
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

            if (Classes.includes("select-episode") && i > 0)
            {
                playNow(AllListItems[i - 1])

                // NOTE: No need to delete it if it's played from the podcast detail view
                console.log(document.getElementById('content-right-header').getElementsByTagName('h1')[0].innerHTML, generateHtmlTitle('Favorites'))
                if (document.getElementById('content-right-header').getElementsByTagName('h1')[0].innerHTML != generateHtmlTitle('Favorites'))
                {
                    deleteFromListView(AllListItems[i])
                }

                break
            }
            else if (i == 0)
            {
                // NOTE: Currently playling episode is the last item in the list
                // NOTE: No need to delete it if it's played from the podcast detail view
                console.log(document.getElementById('content-right-header').getElementsByTagName('h1')[0].innerHTML, generateHtmlTitle('Favorites'))

                if (document.getElementById('content-right-header').getElementsByTagName('h1')[0].innerHTML != generateHtmlTitle('Favorites'))
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

function savePlaybackPosition(feedUrl, _Source, _CurrentTime){
    allFeeds.setPlaybackPositionByEpisodeUrl(feedUrl, _Source, _CurrentTime);
}

function togglePlayPauseButton() {
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

    //Button.innerHTML = $(s_PauseIcon).html()
    $(Button)
        .stop()
        .fadeTo(100, 0.3,
                 function() {
                    $(Button)
                        .html($(s_PauseIcon).html())
                        .fadeTo(80, 0.65, function () {
                            $(Button)
                                .removeAttr('style')
                        })
        })
    
    Button.setAttribute("mode", "pause")

    Player.play()

    navigator.mediaSession.playbackState = "playing";
}

function pausePlayer()
{
    var Button = document.getElementById("play-pause")
    var Player = document.getElementById("player")

    //Button.innerHTML = $(s_PlayIcon).html()
    $(Button)
        .stop()
        .fadeTo(100, 0.3,
                 function() {
                    $(Button)
                        .html($(s_PlayIcon).html())
                        .fadeTo(80, 0.65, function () {
                            $(Button)
                                .removeAttr('style')
                        })
        })
    Button.setAttribute("mode", "play")

    Player.pause()
    
    navigator.mediaSession.playbackState = "paused";
}

function getPlaybackPosition(feedUrl, _Source) {
    playbackPosition = allFeeds.getPlaybackPositionByEpisodeUrl(feedUrl, _Source)
    return playbackPosition ? playbackPosition : 0;
}
/*
function setSpeed()
{
    var Player = document.getElementById("player")

    if (getPreference('speed') !== 1) {
        Player.playbackRate = parseFloat(getPreference('speed'))
    }
}
*/
