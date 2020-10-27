// ---------------------------------------------------------------------------------------------------------------------
// LEFT COLUMN
// ---------------------------------------------------------------------------------------------------------------------

function setItemCounts() {
    $('#menu-episodes .menu-count').html(allNewEpisodes.length());
    $('#menu-favorites .menu-count').html(allFavoritePodcasts.length());
}

function setGridLayout(_List, _Enable) {
    if (_Enable)
        _List.classList.add("grid-layout");
    else
        _List.classList.remove("grid-layout");
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
    let List = document.getElementById("list")
    switch (_View) {
        case "list":
            setGridLayout(List, false)
            setHeaderViewAction("grid")
            break;

        case "grid":
            setGridLayout(List, true)
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
    $('#menu li, #playlists li').removeClass('selected')
}

function addToPlaylist(_PlaylistName, _PodcastName) {
    allPlaylist.memory.addPodcastByName(_PlaylistName, _PodcastName);
}

function removeFromPlaylist(_PlaylistName, _PodcastName) {
    allPlaylist.memory.removePodcastByName(_PlaylistName, _PodcastName);
}