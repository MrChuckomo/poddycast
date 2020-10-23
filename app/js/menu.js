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

    let fileContent = ifExistsReadFile(getNewEpisodesSaveFilePath());
    if (fileContent == "")
        return;
    
    let List = $('#list');
    setGridLayout(List.get(0), false);

    let json  = JSON.parse(fileContent);
    for (var i = json.length - 1; i >= 0 ; i--) {

        let Artwork = getBestArtworkUrl(json[i].channelName);
        let episodeDescription = getEpisodeInfoFromDescription(json[i].episodeDescription);
        
        var ListElement = buildListItem(new cListElement (
            [
                getImagePart(Artwork),
                getBoldTextPart(json[i].episodeTitle),
                getSubTextPart(json[i].duration == undefined ? "" : json[i].duration),
                getTextPart(json[i].channelName),
                getDescriptionPart(s_InfoIcon, episodeDescription),
                getIconButtonPart(s_DeleteIcon)
            ],
            "5em 1fr 6em 1fr 5em 5em"
        ), eLayout.row)
        
        ListElement.onclick = function() {
            playNow(this);
        };
        ListElement.setAttribute("channel", json[i].channelName)
        ListElement.setAttribute("title", json[i].episodeTitle)
        ListElement.setAttribute("type", json[i].episodeType)
        ListElement.setAttribute("url", json[i].episodeUrl)
        ListElement.setAttribute("length", json[i].episodeLength)
        ListElement.setAttribute("artworkUrl", Artwork)

        if (player.isPlaying(json[i].episodeUrl))
            ListElement.classList.add("select-episode")

        List.append(ListElement)
    }
}

function showFavoritesPage() {
    let $favoritesEntry = $('#menu-favorites');
    let title = $favoritesEntry.find('span').html();

    setHeader(generateHtmlTitle(title));
    selectMenuItem($favoritesEntry);
    setHeaderViewAction("list");

    clearBody();

    let fileContent = ifExistsReadFile(getSaveFilePath());
    if (fileContent == "")
        return;

    let JsonContent = sortByName(JSON.parse(fileContent));

    let List = document.getElementById("list");
    setGridLayout(List, true);

    for (let i in JsonContent) {
        let Artwork = JsonContent[i].artworkUrl100;
        if(Artwork == undefined || Artwork == 'undefined') {
            Artwork = JsonContent[i].artworkUrl60;
            if(Artwork == undefined || Artwork == 'undefined') 
                Artwork = "img/generic_podcast_image.png";
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
    if (fileContent == "")
        return;

    let List = document.getElementById("list");
    setGridLayout(List, false);

    let JsonContent = JSON.parse(fileContent);

    // NOTE: Show just the last 100 entries in History
    // TODO: The can be loaded after user interaction

    let Count = (JsonContent.length <= 100 ? JsonContent.length : 100);

    for (let i = JsonContent.length - Count; i < JsonContent.length; i++) {
        let ChannelName = JsonContent[i].channelName
        let EpisodeTitle = JsonContent[i].episodeTitle
        let Artwork = getBestArtworkUrl(ChannelName);

        if (Artwork != 'img/generic_podcast_image.png') {
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

    if (fileExistsAndIsNotEmpty(getSaveFilePath())) {
        JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"));
        List.append(getStatisticsElement("statistics-entry", i18n.__("Favorite Podcasts"),  JsonContent.length));
    } else 
        List.append(getStatisticsElement("statistics-entry", i18n.__("Favorite Podcasts"), 0));

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

    if (fileExistsAndIsNotEmpty(getNewEpisodesSaveFilePath())) {
        JsonContent = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8"));
        List.append(getStatisticsElement("statistics-entry", i18n.__("New Episodes"),  JsonContent.length));
    } else
        List.append(getStatisticsElement("statistics-entry", i18n.__("New Episodes"),  0));

    List.append(getStatisticsElement("statistics-header", i18n.__("Playlists"), null));

    if (fileExistsAndIsNotEmpty(getPlaylistFilePath())) {
        JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), "utf-8"));
        List.append(getStatisticsElement("statistics-entry", i18n.__("Playlists"),  JsonContent.length));
    } else
        List.append(getStatisticsElement("statistics-entry", i18n.__("Playlists"),  0));
}

module.exports = {
    selectMenuItem: selectMenuItem,
    showNewEpisodesPage: showNewEpisodesPage
}