'use strict';

const fs = require('fs');
const Vibrant = require('node-vibrant');
const anime = require('animejs');
const { ipcRenderer } = require('electron');
const global = require('../helper/helper_global');
const entries = require('../helper/helper_entries');
const navigation = require('../helper/helper_navigation');
const Slider = require('../classes/slider_class');
let CContentHelper = require('../helper/content');
let CPlayer = require('../helper/player');

let helper = new CContentHelper();
let player = new CPlayer();
let playerVolume = 0.75;
let volumeOff = false;
let slider = undefined;
const MIN_PLAYER_SPEED = 0.2;
const MAX_PLAYER_SPEED = 4.0;
const PLAYER_SPEED_INCREMENT = 0.1;

function init() {
    slider = new Slider(this);
}
module.exports.init = init;

// clamp number between 0 and 1
const clamp = (num) => Math.max(Math.min(num, 1), 0);

// ---------------------------------------------------------------------------------------------------------------------

function playNow(_Self) {
    let Player = document.getElementById('player');
    let PlayerSource = Player.getElementsByTagName('source')[0];

    // NOTE: Set current episode to play

    selectItem(_Self);

    // NOTE: Set the audio source

    PlayerSource.setAttribute('src', _Self.getAttribute('url'));
    PlayerSource.setAttribute('type', _Self.getAttribute('type'));

    togglePlayPauseButton();

    Player.load();
    Player.currentTime = getPlaybackPosition(_Self.getAttribute('url'));
    Player.addEventListener('timeupdate', updateProgress, false);

    let img = (_Self.getAttribute('episodeImagekUrl') === 'undefined')
        ? _Self.getAttribute('artworkUrl')
        : _Self.getAttribute('episodeImagekUrl');

    document.getElementById('content-right-player-img').src = img;
    document.getElementById('content-right-player-img').style.filter = 'none';
    document.getElementById('content-right-player-title').innerHTML = _Self.getAttribute('title');
    togglePlayPauseButton();

    if (player.paused) {
        togglePlayPauseButton();
    }

    activateArtworkAnimation(img);

    // TODO: needs new solution cause of IPC
    // const mainAppWindow = BrowserWindow.getAllWindows()[0];
    // mainAppWindow.setTitle(_Self.getAttribute('title'));
}
module.exports.playNow = playNow;


/**
 * Pick the most prominent color from the artwork
 * and setup an animation.
 *
 * @param {String} img Artwork URL
 */
function activateArtworkAnimation(img) {
    Vibrant.from(img).getPalette((err, palette) => {
        document.getElementById('content-right-player-img').style.boxShadow = `
            ${palette.Vibrant.hex} 0 -2px 10px,
            ${palette.Muted.hex} 0 -18px 40px
        `;

        anime({
            targets: ['#content-right-player-img'],
            opacity: [.5, 1],
            duration: 1200,
            loop: true,
            direction: 'alternate',
            easing: 'easeInOutSine'
        });

    });
}

/*
    Select a new list item. The current selection is cleared in any case.
    After that set the 'select-episode' class to the list item.

    Args:
        _Self (li): List item to select
*/
function selectItem(_Self) {
    helper.clearListSelection();

    _Self.classList.add('select-episode');
}


/*
    Access the player and skip foward by 30 sec.
*/
function playForward() {
    document.getElementById('player').currentTime += 30;
}
module.exports.playForward = playForward;

/*
    Access the player and skip backward by 30 sec.
*/
function playReply() {
    document.getElementById('player').currentTime -= 30;
}
module.exports.playReply = playReply;

/**
 * Increase the playback speed by PLAYER_SPEED_INCREMENT
 */
function speedUp() {
    let Player = document.getElementById('player');
    const rate = document.querySelector('#content-right-player-speed-indicator');

    Player.playbackRate = Player.playbackRate >= MAX_PLAYER_SPEED ? MIN_PLAYER_SPEED : Player.playbackRate + PLAYER_SPEED_INCREMENT;
    Player.defaultPlaybackRate = Player.playbackRate;
    rate.innerHTML = Player.playbackRate.toFixed(1) + 'x';

    saveSpeed(Player.playbackRate);
}
module.exports.speedUp = speedUp;

/**
 * Decrease the playback speed by PLAYER_SPEED_INCREMENT
 */
function speedDown() {
    let Player = document.getElementById('player');
    const rate = document.querySelector('#content-right-player-speed-indicator');

    Player.playbackRate = Player.playbackRate <= MIN_PLAYER_SPEED ? MAX_PLAYER_SPEED : Player.playbackRate - PLAYER_SPEED_INCREMENT;
    Player.defaultPlaybackRate = Player.playbackRate;
    rate.innerHTML = Player.playbackRate.toFixed(1) + 'x';

    saveSpeed(Player.playbackRate);
}
module.exports.speedDown = speedDown;

function updateProgress() {
    let Player = document.getElementById('player');
    let PlayerSource = Player.getElementsByTagName('source')[0];

    // NOTE: just save every 10 sec.

    if (parseInt(Player.currentTime) % 10 === 0) {
        const Progress = Math.floor((100 * Player.currentTime) / Player.duration);
        savePlaybackPosition(PlayerSource.getAttribute('src'), Player.currentTime, Progress);
    }

    if (Player.ended) {
        // TODO: No need to delete it if it's played from the podcast detail view
        entries.deleteFromFile(PlayerSource.getAttribute('src'));
        nextEpisode();
    }

    // NOTE: Update progress bar

    let Value = 0;

    if (Player.currentTime > 0) {
        Value = Math.floor((100 * Player.currentTime) / Player.duration);
    }

    slider.setValue(Value);
    // let Progress = document.getElementById('content-right-player-progress-bar-progress')

    // Progress.style.width = Value + '%'

    // NOTE: Update player time in extended layout

    global.getFullTime(Player.duration);

    setPlaybackTime(Player.currentTime, 'content-right-player-time');
    setPlaybackTime(Player.duration, 'content-right-player-duration');

    // Update progress bar in taskbar
    // TODO: Needs new solution cause of IPC
    // const mainAppWindow = BrowserWindow.getAllWindows()[0];
    // mainAppWindow.setProgressBar(Value / 100);
}

/**
 * Handle interaction with the main progressbar.
 * @param {number} _ProgressValue - value in percentage (0-100)
 */
function seekProgress(_ProgressValue) {
    let Player = document.getElementById('player');
    let PlayerSource = Player.getElementsByTagName('source')[0];
    Player.currentTime = (_ProgressValue / 100) * Player.duration;
    savePlaybackPosition(PlayerSource.getAttribute('src'), Player.currentTime, _ProgressValue);
}
module.exports.seekProgress = seekProgress;

/*
    Automatically start the next episode after the player progress ended.
    Start the next episode and then delete the current item from the list.
    If the current view is not the one where current episode is playing the playback is paused.
*/
function nextEpisode() {
    let AllListItems = document.getElementsByClassName('list-item-row-layout');
    let SelectedListItems = document.getElementsByClassName('select-episode');

    if (SelectedListItems.length === 1) {
        for (let i = 0; i < AllListItems.length; i++) {
            let Classes = AllListItems[i].getAttribute('class');

            if (Classes.includes('select-episode') && i < (AllListItems.length - 1)) {
                playNow(AllListItems[i + 1]);

                // NOTE: No need to delete it if it's played from the podcast detail view
                ipcRenderer.invoke('i18n', 'Favorites').then((title) => {
                    if (document.getElementById('content-right-header').getElementsByTagName('h1')[0].innerHTML !== title) {
                        entries.deleteFromListView(AllListItems[i]);
                    }
                });
                break;

            } else if (i === (AllListItems.length - 1)) {
                // NOTE: Currently playling episode is the last item in the list
                // NOTE: No need to delete it if it's played from the podcast detail view
                ipcRenderer.invoke('i18n', 'Favorites').then((title) => {
                    if (document.getElementById('content-right-header').getElementsByTagName('h1')[0].innerHTML !== title) {
                        entries.deleteFromListView(AllListItems[i]);
                    }
                });
                pausePlayer();
            }
        }
    } else {
        // NOTE: Current list is not the one which contains the currently playing episode
        pausePlayer();
    }

    navigation.setItemCounts();
}

function setPlaybackTime(_Time, _ElementName) {
    let TimeElement = document.getElementById(_ElementName);
    let FullTime = global.getFullTime(Math.floor(_Time));

    if (!isNaN(FullTime.minutes)) {
        TimeElement.innerHTML = player.getPrettyTime(FullTime.hours) + ':' + player.getPrettyTime(FullTime.minutes) + ':' + player.getPrettyTime(FullTime.seconds);
    }
}
function savePlaybackPosition(_Source, _CurrentTime, _Progress) {
    if (global.fileExistsAndIsNotEmpty(global.newEpisodesSaveFilePath)) {
        let JsonContent = JSON.parse(fs.readFileSync(global.newEpisodesSaveFilePath, 'utf-8'));

        JsonContent.find((item) => {
            if (item.episodeUrl === _Source) {
                item.playbackPosition = _CurrentTime;
                item.progress = _Progress;
                fs.writeFileSync(global.newEpisodesSaveFilePath, JSON.stringify(JsonContent));
            }
        });
    }
}

function togglePlayPauseButton() {
    let Button = document.getElementById('play-pause');
    (Button.getAttribute('mode') === 'play') ? playPlayer() : pausePlayer();
}

module.exports.togglePlayPauseButton = togglePlayPauseButton;

function playPlayer() {
    let Button = document.getElementById('play-pause');
    let Player = document.getElementById('player');

    Button.src = './img/pause-outline.svg';
    Button.setAttribute('mode', 'pause');
    document.getElementById('content-right-player-time').classList.add('active');

    Player.play();
}

function pausePlayer() {
    let Button = document.getElementById('play-pause');
    let Player = document.getElementById('player');

    Button.src = './img/play-outline.svg';
    Button.setAttribute('mode', 'play');
    document.getElementById('content-right-player-time').classList.remove('active');

    Player.pause();
}

function getPlaybackPosition(_Source) {
    let PlaybackPosition = 0;

    if (global.fileExistsAndIsNotEmpty(global.newEpisodesSaveFilePath)) {
        let JsonContent = JSON.parse(fs.readFileSync(global.newEpisodesSaveFilePath, 'utf-8'));

        for (let i = 0; i < JsonContent.length; i++) {
            if (JsonContent[i].episodeUrl === _Source) {
                PlaybackPosition = JsonContent[i].playbackPosition;
                break;
            }
        }
    }

    return PlaybackPosition;
}

function saveSpeed(_Value) {
    global.setPreference('playspeed', _Value);
}


// --------------------------------------------------------------------------------------------------------------------
// MARK: VOLUME HANDLING

/**
 * Increase the playback volume by an offset.
 * @param {float} _Offset - Offset value for increasing the volume, like 0.05 eq. 5%
 */
function increaseVolume(_Offset) {
    let volumeElement = document.getElementById('volume');
    let newVolumeValue = volumeElement.valueAsNumber + _Offset;

    volumeElement.value = newVolumeValue;
    updateVolume(newVolumeValue);
}
module.exports.increaseVolume = increaseVolume;

/**
 * Decrease the playback volume by an offset.
 * @param {float} _Offset - Offset value for increasing the volume, like 0.05 eq. 5%
 */
function decreaseVolume(_Offset) {
    let volumeElement = document.getElementById('volume');
    let newVolumeValue = volumeElement.valueAsNumber - _Offset;

    volumeElement.value = newVolumeValue;
    updateVolume(newVolumeValue);
}
module.exports.decreaseVolume = decreaseVolume;

/**
 * Set the volume by moving the volume slider dynamically.
 * @param {*} _Self - Volume slider
 */
function setVolume(_Self) {
    updateVolume(_Self.valueAsNumber);
}
module.exports.setVolume = setVolume;

function volumeToggle() {
    let Player = document.getElementById('player');
    let VolumeIcon = document.getElementById('volume-button');
    let VolumeFill = document.getElementById('volume-fill');

    if (volumeOff === true) {
        VolumeIcon.src = './img/volume-high-outline.svg';
        volumeOff = false;
        Player.volume = clamp(Math.exp(6.908 * playerVolume) / 1000);
        VolumeFill.style.width = parseFloat(playerVolume * 100).toFixed(2) + '%';
    } else {
        VolumeIcon.src = './img/volume-mute-outline.svg';
        volumeOff = true;
        Player.volume = 0;
        VolumeFill.style.width = '0%';
    }
}
module.exports.volumeToggle = volumeToggle;

function updateVolume(_VolumeValue) {
    let Player = document.getElementById('player');
    let VolumeIcon = document.getElementById('volume-button');
    let VolumeFill = document.getElementById('volume-fill');

    if (_VolumeValue <= 0.001) {
        VolumeIcon.src = './img/volume-off-outline.svg';
        Player.volume = 0.0;
        VolumeFill.style.width = '0%';
    } else {
        // creates a smooth exponential increase in volume rather than linear [0-1]
        Player.volume = clamp(Math.exp(6.908 * _VolumeValue) / 1000);
        VolumeFill.style.width = parseFloat(_VolumeValue * 100).toFixed(2) + '%';

        if (_VolumeValue <= 0.1) {
            VolumeIcon.src = './img/volume-off-outline.svg';
        } else if (_VolumeValue <= 0.4) {
            VolumeIcon.src = './img/volume-low-outline.svg';
        } else if (_VolumeValue <= 0.6) {
            VolumeIcon.src = './img/volume-medium-outline.svg';
        } else {
            VolumeIcon.src = './img/volume-high-outline.svg';
        }
    }

    if (volumeOff === false) {
        playerVolume = _VolumeValue;
    }

    global.setPreference('volume', _VolumeValue);
}
