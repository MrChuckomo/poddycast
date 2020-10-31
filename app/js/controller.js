function initController() {
    initLink();
    initInput();
    initPlayer();
}

/*
 *  Link
 */

function initLink() {
    $('#menu-episodes').click(showNewEpisodesPage)
    $('#menu-favorites').click(showFavoritesPage)
    $('#menu-refresh').click(readFeeds)
    $('#menu-history').click(showHistoryPage)
    $('#menu-statistics').click(showStatisticsPage)
    $('#new_list-button').click(createNewPlaylist)
}

/*
 *  Input
 */

function matchText(e) {
    var char = String.fromCharCode(e.which)
    if (char.match(/^[^A-Za-z0-9+!?#\.\-]+$/)) 
        e.preventDefault();
}

function matchTextSearch(e) {
    var char = String.fromCharCode(e.which)
    if (char.match(/^[^A-Za-z0-9+!?#\.\-\ ']+$/)) 
        e.preventDefault();
}

function initInput() {
    $('input').not('#search-input').keypress(function (e) {
        matchText(e)
    })
    
    $('#search-input').keypress(function (e) {
        matchTextSearch(e)
    })

    $('#search-input').keyup(function (e) {
        search(this, e);
    })

    $('#new_list-input').keyup(function (e) {
        inputNewPlaylist(this, e);
    })
}

/*
 *  Player
 */

function initPlayer() {
    $('#content-right-player-progress-bar').click(function (e) {
        seekProgress(this, e);
    })

    $('#content-right-player-speed-down').click(function () {
        speedDown(this);
    })

    $('#content-right-player-speed-up').click(function () {
        speedUp(this);
    })

    $('.content-right-player-speed-btn').on('wheel', function(event){
        setSpeedWithWheelMouse(event);
    });

    $('#replay-30-sec').click(playReply)
    $('#play-pause').click(playPause)
    $('#forward-30-sec').click(playForward)
}
