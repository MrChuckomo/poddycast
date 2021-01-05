// ---------------------------------------------------------------------------------------------------------------------
// LEFT COLUMN
// ---------------------------------------------------------------------------------------------------------------------

function setItemCounts() {
    $('#menu-episodes .menu-count').html(allNewEpisodes.length());
    $('#menu-favorites .menu-count').html(allFavoritePodcasts.length());
}

function setGridLayout(_Enable) {
    if (_Enable)
        $('#list').addClass("grid-layout");
    else
        $('#list').removeClass("grid-layout");
}

// ---------------------------------------------------------------------------------------------------------------------
// RIGHT COLUMN
// ---------------------------------------------------------------------------------------------------------------------

function setHeaderViewAction(_Mode) {
    let $content_right_header_actions = $('#content-right-header-actions');
    switch (_Mode) {
        case "list":
            $content_right_header_actions.html(s_ListView);
            $content_right_header_actions.find('svg').click(function () {
                toggleList('list');
            });
            break;

        case "grid":
            $content_right_header_actions.html(s_GridView);
            $content_right_header_actions.find('svg').click(function () {
                toggleList('grid');
            });
            break;

        default: 
            $content_right_header_actions.html(''); 
            break;
    }
}

function toggleList(_View) {
    switch (_View) {
        case "list":
            setGridLayout(false)
            setHeaderViewAction("grid")
            break;

        case "grid":
            setGridLayout(true)
            setHeaderViewAction("list")
            break;

        default: 
            break;
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// MENU & PLAYLISTS
// ---------------------------------------------------------------------------------------------------------------------

function clearMenuSelection() {
    $('#menu li, #playlists li').removeClass('selected');
}

function addToPlaylist(_PlaylistName, _PodcastFeedUrl) {
    allPlaylist.memory.addPodcastByFeedUrl(_PlaylistName, _PodcastFeedUrl);
}

function removeFromPlaylist(_PlaylistName, _PodcastFeedUrl) {
    allPlaylist.memory.removePodcastByFeedUrl(_PlaylistName, _PodcastFeedUrl);
}