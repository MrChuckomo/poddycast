var CPlayer = require('./js/helper/player')

var player = new CPlayer()

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

    let List = $('#list');
    setGridLayout(List.get(0), false);

    if(allNewEpisodes.isEmpty())
        setNothingToShowBody(s_NewEpisodesNothingFoundIcon, 'new_episodes-nothing-to-show');

    for (let i in allNewEpisodes.episodes) 
        List.append(allNewEpisodes.ui.getNewItemList(allNewEpisodes.get(i)));
}

function showFavoritesPage() {
    let $favoritesEntry = $('#menu-favorites');
    let title = $favoritesEntry.find('span').html();

    setHeader(generateHtmlTitle(title));
    selectMenuItem($favoritesEntry);
    setHeaderViewAction("list");

    clearBody();

    if (allFavoritePodcasts.isEmpty())
        return;

    let JsonContent = allFavoritePodcasts.getAll();

    let List = document.getElementById("list");
    setGridLayout(List, true);

    for (let i in JsonContent) {
        let Artwork = JsonContent[i].artworkUrl100;
        if(Artwork == undefined || Artwork == 'undefined') {
            Artwork = JsonContent[i].artworkUrl60;
            if(Artwork == undefined || Artwork == 'undefined') 
                Artwork = getGenericArtwork();
        }

        let ListElement = getPodcastElement("podcast-entry", Artwork, null, JsonContent[i].collectionName, s_Favorite);
        
        ListElement.setAttribute('draggable', true);
        ListElement.addEventListener('dragstart', handleDragStart, false);

        let HeaderElement = ListElement.getElementsByClassName('podcast-entry-header')[0]

        HeaderElement.getElementsByTagName("img")[0].setAttribute("draggable", false)
        HeaderElement.setAttribute("feedUrl", JsonContent[i].feedUrl)
        HeaderElement.onclick = function () {
            showAllEpisodes(this);
        }

        List.append(ListElement)
    }
}

function showHistoryPage() {
    let $historyEntry = $('#menu-history');
    let title = $historyEntry.find('span').html();

    setHeader(generateHtmlTitle(title), '');
    selectMenuItem($historyEntry);

    clearBody();

    let fileContent = ifExistsReadFile(getArchivedFilePath());
    let JsonContent = JSON.parse(fileContent == "" ? "[]" : fileContent);

    let List = document.getElementById("list");
    setGridLayout(List, false);

    // NOTE: Show just the last 100 entries in History
    // TODO: The can be loaded after user interaction

    let Count = (JsonContent.length <= 100 ? JsonContent.length : 100);
    if(Count == 0)
        setNothingToShowBody(s_HistoryNothingFoundIcon, 'history-nothing-to-show');

    for (let i = JsonContent.length - Count; i < JsonContent.length; i++) {
        let EpisodeTitle = JsonContent[i].episodeTitle
        let Artwork = JsonContent[i].artwork;

        if (!isGenericArtwork(Artwork)) {
            let DateTime = new Date(JsonContent[i].date);
            let ListElement = buildListItem(new cListElement(
                [
                    getImagePart(Artwork),
                    getBoldTextPart(EpisodeTitle),
                    getSubTextPart(DateTime.toLocaleString())
                ],
                '5em 3fr 1fr'
            ), eLayout.row);

            List.insertBefore(ListElement, List.childNodes[0]);
        }
    }
}

function showStatisticsPage() {
    let $statisticsEntry = $('#menu-statistics');
    let title = $statisticsEntry.find('span').html();

    setHeader(generateHtmlTitle(title), '');
    selectMenuItem($statisticsEntry);

    clearBody();

    let JsonContent = null;

    let List = document.getElementById("list");
    setGridLayout(List, false);

    List.append(getStatisticsElement("statistics-header", "Podcasts", null));

    List.append(getStatisticsElement("statistics-entry", i18n.__("Favorite Podcasts"), allFavoritePodcasts.length()));

    if (fileExistsAndIsNotEmpty(getArchivedFilePath())) {
        JsonContent = JSON.parse(fs.readFileSync(getArchivedFilePath(), "utf-8"));
        List.append(getStatisticsElement("statistics-entry", i18n.__("Last Podcast"),  JsonContent[JsonContent.length - 1].channelName));
    } else
        List.append(getStatisticsElement("statistics-entry", i18n.__("Last Podcast"),  "None"));

    List.append(getStatisticsElement("statistics-header", i18n.__("Episodes"), null));

    if (fileExistsAndIsNotEmpty(getArchivedFilePath()))
        List.append(getStatisticsElement("statistics-entry", i18n.__("History Items"),  JsonContent.length));
    else
        List.append(getStatisticsElement("statistics-entry", i18n.__("History Items"),  0));

    List.append(getStatisticsElement("statistics-entry", i18n.__("New Episodes"),  allNewEpisodes.length()));

    List.append(getStatisticsElement("statistics-header", i18n.__("Playlists"), null));

    List.append(getStatisticsElement("statistics-entry", i18n.__("Playlists"),  allPlaylist.memory.length()));
}