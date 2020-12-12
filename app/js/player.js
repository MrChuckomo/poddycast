'use strict'

const { BrowserWindow } = require('electron').remote

const { systemPreferences } = require('electron')
var CCOntentHelper = require('./js/helper/content')
var CPlayer = require('./js/helper/player')

var helper = new CCOntentHelper()
var player = new CPlayer()
var playerVolume = 0.75
var volumeOff = false
const MIN_PLAYER_SPEED = 0.2
const MAX_PLAYER_SPEED = 4.0
const PLAYER_SPEED_INCREMENT = 0.1

// clamp number between 0 and 1
const clamp = (num) => Math.max(Math.min(num, 1), 0);

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

function playNow(_Self) {
    let Player = document.getElementById('player')
    let PlayerSource = Player.getElementsByTagName('source')[0]

    // NOTE: Set old played episode to delete icon again

    let FeedUrl = PlayerSource.getAttribute('src')
    let AllListItems = document.getElementsByClassName('podcast-entry')

    for (let i = 0; i < AllListItems.length; i++) {
        if (AllListItems[i].getAttribute('url') === FeedUrl) {
            AllListItems[i].getElementsByTagName('svg')[0].innerHTML = s_Delete
            break
        }
    }

    // NOTE: Set current episode to play

    selectItem(_Self)

    // NOTE: Set the audio source

    PlayerSource.setAttribute('src', _Self.getAttribute('url'))
    PlayerSource.setAttribute('type', _Self.getAttribute('type'))

    togglePlayPauseButton()

    Player.load()
    Player.currentTime = getPlaybackPosition(_Self.getAttribute('url'))
    Player.addEventListener('timeupdate', updateProgress, false)

    document.getElementById('content-right-player-img').src = _Self.getAttribute('artworkUrl')
    document.getElementById('content-right-player-title').innerHTML = _Self.getAttribute('title')
    togglePlayPauseButton()

    if (player.paused) {
        togglePlayPauseButton()
    }

    const mainAppWindow = BrowserWindow.getAllWindows()[0]

    mainAppWindow.setTitle(_Self.getAttribute('title'))
}


/*
    Select a new list item. The current selection is cleared in any case.
    After that set the 'select-episode' class to the list item.

    Args:
        _Self (li): List item to select
*/
function selectItem(_Self) {
    helper.clearListSelection()

    _Self.classList.add('select-episode')
}


/*
    Pause or continue the playback.
    Function can be called to toggle between play and pause.
*/
function playPause() {
    document.getElementById('play-pause')

    togglePlayPauseButton()
}


/*
    Access the player and skip foward by 30 sec.
*/
function playForward() {
    document.getElementById('player').currentTime += 30
}


/*
    Access the player and skip backward by 30 sec.
*/
function playReply() {
    document.getElementById('player').currentTime -= 30
}

/**
 * Increase the playback speed by PLAYER_SPEED_INCREMENT
 */
function speedUp() {
    let Player = document.getElementById('player')
    const rate = document.querySelector('#content-right-player-speed-indicator')

    Player.playbackRate = Player.playbackRate >= MAX_PLAYER_SPEED ? MIN_PLAYER_SPEED : Player.playbackRate + PLAYER_SPEED_INCREMENT
    Player.defaultPlaybackRate = Player.playbackRate
    rate.innerHTML = Player.playbackRate.toFixed(1) + 'x'

    saveSpeed(Player.playbackRate)
}

/**
 * Decrease the playback speed by PLAYER_SPEED_INCREMENT
 */
function speedDown() {
    let Player = document.getElementById('player')
    const rate = document.querySelector('#content-right-player-speed-indicator')

    Player.playbackRate = Player.playbackRate <= MIN_PLAYER_SPEED ? MAX_PLAYER_SPEED : Player.playbackRate - PLAYER_SPEED_INCREMENT
    Player.defaultPlaybackRate = Player.playbackRate
    rate.innerHTML = Player.playbackRate.toFixed(1) + 'x'

    saveSpeed(Player.playbackRate)
}

function updateProgress() {
    let Player = document.getElementById('player')
    let PlayerSource = Player.getElementsByTagName('source')[0]
    const mainAppWindow = BrowserWindow.getAllWindows()[0]

    // NOTE: just save every 10 sec.

    if (parseInt(Player.currentTime) % 10 === 0) {
        savePlaybackPosition(PlayerSource.getAttribute('src'), Player.currentTime)
    }

    if (Player.ended) {
        // TODO: No need to delete it if it's played from the podcast detail view
        deleteFromFile(PlayerSource.getAttribute('src'))
        nextEpisode()
    }

    // NOTE: Update progress bar

    let Value = 0;

    if (Player.currentTime > 0) {
        Value = Math.floor((100 / Player.duration) * Player.currentTime)
    }

    let Progress = document.getElementById('content-right-player-progress-bar-progress')

    Progress.style.width = Value + '%'

    // NOTE: Update player time in extended layout

    getFullTime(Player.duration)

    setPlaybackTime(Player.currentTime, 'content-right-player-time')
    setPlaybackTime(Player.duration, 'content-right-player-duration')

    // Update progress bar in taskbar
    mainAppWindow.setProgressBar(Value / 100)
}

function seekProgress(_Self, _Event) {
    // NOTE: Click position / div element whole width

    let Player = document.getElementById('player')
    let PlayerSource = Player.getElementsByTagName('source')[0]
    let percent = _Event.offsetX / _Self.offsetWidth;

    Player.currentTime = percent * Player.duration;

    savePlaybackPosition(PlayerSource.getAttribute('src'), Player.currentTime)
}


/*
    Automatically start the next episode after the player progress ended.
    Start the next episode and then delete the current item from the list.
    If the current view is not the one where current episode is playing the playback is paused.
*/
function nextEpisode() {
    let AllListItems = document.getElementsByClassName('list-item-row-layout')
    let SelectedListItems = document.getElementsByClassName('select-episode')

    if (SelectedListItems.length === 1) {
        for (let i = 0; i < AllListItems.length; i++) {
            let Classes = AllListItems[i].getAttribute('class')

            if (Classes.includes('select-episode') && i < (AllListItems.length - 1)) {
                playNow(AllListItems[i + 1])

                // NOTE: No need to delete it if it's played from the podcast detail view

                if (document.getElementById('content-right-header').getElementsByTagName('h1')[0].innerHTML !== i18n.__('Favorites')) {
                    deleteFromListView(AllListItems[i])
                }

                break
            } else if (i === (AllListItems.length - 1)) {
                // NOTE: Currently playling episode is the last item in the list
                // NOTE: No need to delete it if it's played from the podcast detail view

                if (document.getElementById('content-right-header').getElementsByTagName('h1')[0].innerHTML !== i18n.__('Favorites')) {
                    deleteFromListView(AllListItems[i])
                }

                pausePlayer()
            }
        }
    } else {
        // NOTE: Current list is not the one which contains the currently playing episode

        pausePlayer()
    }

    setItemCounts()
}

function setPlaybackTime(_Time, _ElementName) {
    let TimeElement = document.getElementById(_ElementName)
    let FullTime = getFullTime(Math.floor(_Time))

    if (!isNaN(FullTime.minutes)) {
        TimeElement.innerHTML = player.getPrettyTime(FullTime.hours) + ':' + player.getPrettyTime(FullTime.minutes) + ':' + player.getPrettyTime(FullTime.seconds)
    }
}

function savePlaybackPosition(_Source, _CurrentTime) {
    if (fs.existsSync(getNewEpisodesSaveFilePath()) && fs.readFileSync(getNewEpisodesSaveFilePath(), 'utf-8') !== '') {
        let JsonContent = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), 'utf-8'))

        for (let i = 0; i < JsonContent.length; i++) {
            if (JsonContent[i].episodeUrl === _Source) {
                JsonContent[i].playbackPosition = _CurrentTime
                fs.writeFileSync(getNewEpisodesSaveFilePath(), JSON.stringify(JsonContent))
                break
            }
        }
    }
}

function togglePlayPauseButton() {
    let Player = document.getElementById('player')
    let Button = document.getElementById('play-pause')

    if (Button.getAttribute('mode') === 'play') {
        playPlayer()
    } else {
        pausePlayer()
    }
}

function playPlayer() {
    let Button = document.getElementById('play-pause')
    let Player = document.getElementById('player')

    Button.innerHTML = s_Pause
    Button.setAttribute('mode', 'pause')

    Player.play()
}

function pausePlayer() {
    let Button = document.getElementById('play-pause')
    let Player = document.getElementById('player')

    Button.innerHTML = s_Play
    Button.setAttribute('mode', 'play')

    Player.pause()
}

function getPlaybackPosition(_Source) {
    let PlaybackPosition = 0

    if (fs.existsSync(getNewEpisodesSaveFilePath()) && fs.readFileSync(getNewEpisodesSaveFilePath(), 'utf-8') !== ''){
        let JsonContent = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), 'utf-8'))

        for (let i = 0; i < JsonContent.length; i++) {
            if (JsonContent[i].episodeUrl === _Source) {
                PlaybackPosition = JsonContent[i].playbackPosition
                break
            }
        }
    }

    return PlaybackPosition
}

function saveSpeed(_Value) {
    setPreference('playspeed', _Value)
}

function setPlaybackVolume(_Self) {
    let Player = document.getElementById('player')
    let VolumeFill = document.getElementById('volume-fill')

    if (_Self.valueAsNumber === 0.001) {
        Player.volume = _Self.valueAsNumber
        VolumeFill.style.width = '0%'
    } else {
        // creates a smooth exponential increase in volume rather than linear [0-1]
        Player.volume = clamp(Math.exp(6.908 * _Self.valueAsNumber) / 1000)
        VolumeFill.style.width = parseFloat(_Self.valueAsNumber * 100).toFixed(2) + '%'
    }

    if (volumeOff === false) {
        playerVolume = _Self.valueAsNumber
    }

    setPreference('volume', _Self.valueAsNumber)
}

function volumeToggle() {
    let Player = document.getElementById('player')
    let VolumeFill = document.getElementById('volume-fill')

    if (volumeOff === true) {
        volumeOff = false
        Player.volume = clamp(Math.exp(6.908 * playerVolume) / 1000)
        VolumeFill.style.width = parseFloat(playerVolume * 100).toFixed(2) + '%'
    } else {
        volumeOff = true
        Player.volume = 0
        VolumeFill.style.width = '0%'
    }
}
