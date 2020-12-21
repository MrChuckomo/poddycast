
function selectMenuItem(_MenuId) {
    let $menuItem = _MenuId;

    clearTextField($('#search-input').get(0));
    clearTextField($('#new_list-input').get(0));

    loseFocusTextField("search-input");
    loseFocusTextField("new_list-input");

    clearMenuSelection();

    $menuItem.addClass("selected");
}

function showNewEpisodesPage() {
    let $newEpisodesEntry = $('#menu-episodes');
    let title = $newEpisodesEntry.find('span').html();
    
    setHeader(generateHtmlTitle(title), '');
    selectMenuItem($newEpisodesEntry);

    clearBody();
    setScrollPositionOnTop();

    setGridLayout(false);

    allNewEpisodes.ui.showAll();
}

function showFavoritesPage() {
    let $favoritesEntry = $('#menu-favorites');
    let title = $favoritesEntry.find('span').html();

    setHeader(generateHtmlTitle(title));
    selectMenuItem($favoritesEntry);
    setHeaderViewAction("list");

    clearBody();
    setScrollPositionOnTop();

    let JsonContent = allFavoritePodcasts.getAll();

    setGridLayout(true);
    
    if (allFavoritePodcasts.isEmpty())
        allFavoritePodcasts.ui.showNothingToShowPage();

    let List = document.getElementById("list");
    for (let i in JsonContent) {
        let Artwork = getBestArtworkUrl(JsonContent[i].feedUrl);

        let ListElement = getPodcastElement("podcast-entry", Artwork, null, JsonContent[i].data.collectionName, s_FullHeart);
        
        ListElement.setAttribute('draggable', true);
        ListElement.addEventListener('dragstart', handleDragStart, false);

        let HeaderElement = ListElement.getElementsByClassName('podcast-entry-header')[0]

        HeaderElement.getElementsByTagName("img")[0].setAttribute("draggable", false)
        HeaderElement.setAttribute("feedUrl", JsonContent[i].feedUrl)
        HeaderElement.onclick = function () {
            showAllEpisodes(this);
        }

        let $heartButton = $(ListElement).find('.podcast-entry-actions');
        $heartButton.click(function () {
            $(this).stop();
            unsubscribeListElement($(this).find('svg').get(0));
        });
        
        $heartButton.hoverIntent(function () {
            setHeartContent($(this).find('svg'), true);
        }, function () {
            setHeartContent($(this).find('svg'), false);
        });

        $(ListElement).mouseleave(function () {
            setHeartContent($(this).find('svg'), false);
        })

        List.append(ListElement)
    }
}

function showArchivePage() {
    let $archiveEntry = $('#menu-archive');
    let title = $archiveEntry.find('span').html();
    
    setHeader(generateHtmlTitle(title), '');
    selectMenuItem($archiveEntry);

    clearBody();
    setScrollPositionOnTop();

    setGridLayout(false);

    allArchiveEpisodes.ui.showAll()
}

function showStatisticsPage() {
    let $statisticsEntry = $('#menu-statistics');
    let title = $statisticsEntry.find('span').html();

    setHeader(generateHtmlTitle(title), '');
    selectMenuItem($statisticsEntry);

    clearBody();
    setScrollPositionOnTop();

    setGridLayout(false);

    let List = document.getElementById("list");

    List.append(getStatisticsElement("statistics-header", "Podcasts", null));

    List.append(getStatisticsElement("statistics-entry", i18n.__("Favorite Podcasts"), allFavoritePodcasts.length()));

    if(!allNewEpisodes.isEmpty()) {
        let channelName = allFavoritePodcasts.getByFeedUrl(allNewEpisodes.get(0).feedUrl).data.collectionName;
        List.append(getStatisticsElement("statistics-entry", i18n.__("Last Podcast"),  channelName));
    } else
        List.append(getStatisticsElement("statistics-entry", i18n.__("Last Podcast"),  "None"));

    List.append(getStatisticsElement("statistics-header", i18n.__("Episodes"), null));

    List.append(getStatisticsElement("statistics-entry", i18n.__("Archive Items"),  allArchiveEpisodes.length()));
    
    List.append(getStatisticsElement("statistics-entry", i18n.__("New Episodes"),  allNewEpisodes.length()));

    List.append(getStatisticsElement("statistics-header", i18n.__("Playlists"), null));

    List.append(getStatisticsElement("statistics-entry", i18n.__("Playlists"),  allPlaylist.memory.length()));
}