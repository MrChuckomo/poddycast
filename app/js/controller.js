function initController() {
    initLink();
    initInput();

    enableOpenLinkInDefaultBrowser();
}

function enableOpenLinkInDefaultBrowser() {
    $('body').on('click', 'a', (event) => {
        event.preventDefault();
        require("electron").shell.openExternal(event.target.href);
    });
    
    $('body').on('auxclick', 'a', (event) => {
        event.preventDefault();
        require("electron").shell.openExternal(event.target.href);
    });
}

/*
 *  Link
 */

function initLink() {
    $('#menu-episodes').click(showNewEpisodesPage)
    $('#menu-favorites').click(showFavoritesPage)
    $('#menu-refresh').click(readFeeds)
    $('#menu-archive').click(showArchivePage)
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
/*
function initPlayer() {
    /*
    $('#content-right-player-progress-bar').click(function (e) {
        seekProgress(this, e);
    })
    */ /*

    $('#content-right-player-speed-down').click(function () {
        speedDown(this);
    })

    $('#content-right-player-speed-up').click(function () {
        speedUp(this);
    })

    $('.content-right-player-speed-btn').on('wheel', function(event){
        setSpeedWithWheelMouse(event);
    });
     
    $('#replay-30-sec').click(() => playerManager.reply())
    $('#play-pause').click(() => playerManager.togglePlayPause())
    $('#forward-30-sec').click(() => playerManager.forward())
}
*/