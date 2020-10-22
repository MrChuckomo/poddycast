var CContentHelper = require('./js/helper/content')
var CPlayer        = require('./js/helper/player')

var helper = new CContentHelper()
var player = new CPlayer()

class Playlist {
    constructor(index, name, list) {
        this.index = index;
        this.name = name;
        this.list = list;
    }

    setIndex(index) {
        this.index = index;
    }

    getIndex() {
        return this.index;
    }

    setName(name) {
        this.name = name;
    }

    getName() {
        return this.name;
    }

    setIndex(list) {
        this.list = list;
    }

    getList() {
        return this.list;
    }
}

class PlaylistsInMemory {
    constructor() {
        this.load();
    }

    load() {
        let fileContent = ( fs.existsSync(getPlaylistFilePath()) ? 
            fs.readFileSync(getPlaylistFilePath(), "utf-8") : ""
        );
        this.playlists = JSON.parse(fileContent == "" ? "[]": fileContent);

        for(let i in this.playlists) {
            let pl = this.playlists[i];
            this.playlists[i] = new Playlist(pl.index, pl.playlistName, pl.podcastList);
        }
    }

    update() {
        let playlists = [];
        for(let i in this.playlists) {
            let pl = this.playlists[i];
            playlists.push({index: pl.index, playlistName: pl.name, podcastList: pl.list})
        }
        fs.writeFileSync(getPlaylistFilePath(), JSON.stringify(playlists));
    }

    length() {
        return this.playlists.length;
    }

    getByIndex(index) {
        let i = this.findByIndex(index);
        return (i == -1 ? undefined :  this.playlists[i]);
    }

    getByName(name) {
        let i = this.findByName(name);
        return (i == -1 ? undefined :  this.playlists[i]);
    }

    findByIndex(index) {
        for(let i in this.playlists)
            if(index == this.playlists[i].getIndex())
                return i;
        return -1;
    }

    findByName(name) {
        for(let i in this.playlists) 
            if(name == this.playlists[i].getName())
                return i;
        return -1;
    }
/*
    addPlaylist(name) {
        let maxIndex = (this.length() == 0 ? -1 : this.playlists[this.length() - 1].getIndex());
        if(this.findByName(name) == -1) {
            let playlist = new Playlist(maxIndex + 1, name, []);
            this.playlists.push(playlist);
            this.update();
            return playlist;
        }
        return false;
    }
*/
    addPlaylist(name) {
        let maxIndex = (this.length() == 0 ? -1 : this.playlists[this.length() - 1].getIndex());
        while(this.findByName(name) != -1) 
            name += "#"
        let playlist = new Playlist(maxIndex + 1, name, []);
        this.playlists.push(playlist);
        this.update();
        return playlist;
    }

    renameByIndex(index, name) {
        if(this.findByName(name) == -1) {
            let i = this.findByIndex(index);
            if(i != -1) {
                this.playlists[i].setName(name);
                this.update();
                return true;
            }
        }
        return false;
    }

    renameByName(oldName, name) {
        if(this.findByName(name) == -1) {
            let i = this.findByName(oldName);
            if(i != -1) {
                this.playlists[i].setName(name);
                this.update();
                return true;
            }
        }
        return false;
    }

    removeByIndex(index) {
        let i = this.findByIndex(index);
        if(i != -1) {
            this.playlists.splice(i, 1);
            console.log(this.length());
            this.update();
            return true;
        }
        return false;
    }

    removeByName(name) {
        let i = this.findByName(name);
        if(i != -1) {
            this.playlists.splice(i, 1);
            this.update();
            return true;
        }
        return false;
    }

    findPodcast(i, podcast) {
        if(i < 0 || i >= this.length())
            return -1;
        return this.playlists[i].list.indexOf(podcast);
    }

    addPodcastByName(name, podcast) {
        let i = this.findByName(name);
        if(i != -1 && this.findPodcast(i, podcast) == -1) {
            this.playlists[i].list.push(podcast);
            this.update();
            return true;
        }
        return false;
    }

    removePodcastByName(name, podcast) {
        let i = this.findByName(name);
        let k = this.findPodcast(i, podcast);
        if(i != -1 && k != -1) {
            this.playlists[i].list.splice(k, 1);
            this.update();
            return true;
        }
        return false;
    }

}

class PlaylistsInUI {
    constructor(playlists) {
        this.$playlists = $('#content-left #playlists ul');
        this.show(playlists);
    }

    show(playlists) {
        for(let i in playlists)
            this.add(playlists[i]);
    }

    add(playlist) {
        let $input = $('<input></input>').val(playlist.name)
                                         .prop( "disabled", true )
                                         .prop('type','text');
        $input.focusout(function () { /*
            if (this.value == ""){
                let HeaderName = document.getElementById("content-right-header").getElementsByTagName("h1")[0].innerHTML

                _Self.value = HeaderName
            }

            renamePlaylistInline(_Self)*/
            
            /*
            if(this.value != "") {
                let index = $(this).parent().attr('index');
                if(allPlaylist.renameByIndex(index, this.value))
                    setHeader(this.value);
            }
            */
           ifRenamePlaylistUpdateUI(this);
        });
        $input.keypress(function (e) {
            matchText(e);
        });
        $input.keyup(function (e) {
            renamePlaylist(this, e);
        });
        $input.css('pointer-events', 'none')

        let $playlist = $('<li></li>')//.addClass("selected")
                                      .attr('index', '' + playlist.index)
                                      .attr('playlist', playlist.name);
        $playlist.click(function () {
            showPlaylistContent(this);
        });
        $playlist.dblclick(function () {
            enableRename(this);
        });
        $playlist.on('dragenter', function (e) {
            //e = e.originalEvent;
            handleDragEnter(this);//e);
        });
        $playlist.on('dragover', function (e) {
            e = e.originalEvent;
            handleDragOver(this,e);
        });
        $playlist.on('dragleave', function (e) {
            e = e.originalEvent;
            handleDragLeave(this, e);
        });
        $playlist.on('drop', function (e) {
            e = e.originalEvent;
            handleDrop(this, e);
        });

        setContextMenu($playlist.get(0))

        $playlist.append($input);
        this.$playlists.append($playlist);
    }

    getByIndex(index) {
        return this.$playlists.find( 'li[index="' + index + '"]' );
    }

    getByName(name) {
        return this.$playlists.find( 'li[playlist="' + name + '"]' );
    }

    renameByIndex(index, name) {
        let $playlist = this.getByIndex(index);
        $playlist.find('input').val(name);
        $playlist.attr('playlist', name);
    }

    renameByName(oldName, name) {
        let $playlist = this.getByName(name);
        $playlist.find('input').val(name);
        $playlist.attr('playlist', name);
    }

    removeByName(name) {
        this.$playlists.find( 'li[playlist="' + name + '"]' ).remove();
    }

    removeByIndex(index) {
        this.$playlists.find( 'li[index="' + index + '"]' ).remove();
    }
}

class Playlists {
    constructor() {
        this.memory = new PlaylistsInMemory();
        console.log(this.memory.playlists)
        this.ui = new PlaylistsInUI(this.memory.playlists);
    }

    show() {
        this.memory.load();
        this.ui.show();
    }

    add(name) {
        let playlist = this.memory.addPlaylist(name);
        if(playlist) 
            this.ui.add(playlist);
        return playlist;
    }

    renameByIndex(index, name) {
        if(this.memory.renameByIndex(index, name)) {
            this.ui.renameByIndex(index, name);
            return true;
        }
        return false;
    }

    renameByName(oldName, name) {
        if(this.memory.renameByName(oldName, name)) {
            this.ui.renameByName(oldName, name);
            return true;
        }
        return false;
    }

    removeByIndex(index, name) {
        if(this.memory.removeByIndex(index, name)) {
            this.ui.removeByIndex(index, name);
            return true;
        }
        return false;
    }

    removeByName(oldName, name) {
        if(this.memory.removeByName(oldName, name)) {
            this.ui.removeByName(oldName, name);
            return true;
        }
        return false;
    }
}

var allPlaylist = null;

/*

function getInputEntry(_Name)
{
    var InputItem = document.createElement("input")

    InputItem.value = _Name
    InputItem.type = "text"
    InputItem.disabled = true
    InputItem.setAttribute("onfocusout", "clearRenameFocus(this)")
    InputItem.setAttribute("onkeypress", "matchText(event)")
    
    InputItem.setAttribute("onkeyup", "renamePlaylist(this, event)")

    //$(InputItem).keyfilter(/[^#\*@0-9]/);

    return InputItem
}
*/


// ---------------------------------------------------------------------------------------------------------------------
/*
function createNewPlaylist() {
    var $input = $("footer input")
    var playlistName = $input.val().trim()
    if(playlistName == "")
        return;
    var JsonContent = []
    if (fs.existsSync(getPlaylistFilePath()) && fs.readFileSync(getPlaylistFilePath(), "utf-8") != "")
        JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), "utf-8"))
    else
        fs.writeFileSync(getPlaylistFilePath(), JSON.stringify(JsonContent))
    
    for(let i in JsonContent) {
        let pl = JsonContent[i]
        if(pl.playlistName == playlistName)
            return;
    }

    var NewPlaylist = document.createElement("li")
    NewPlaylist.setAttribute("onclick", "showPlaylistContent(this)")
    NewPlaylist.setAttribute("ondblclick", "enableRename(this)")
    
    NewPlaylist.setAttribute("index", "" + JsonContent.length)
    NewPlaylist.setAttribute("playlist", playlistName)

    NewPlaylist.addEventListener('dragenter', handleDragEnter, false);
    NewPlaylist.addEventListener('dragover', handleDragOver, false);
    NewPlaylist.addEventListener('dragleave', handleDragLeave, false);
    NewPlaylist.addEventListener('drop', handleDrop, false);
    NewPlaylist.append(getInputEntry(playlistName))
    setContextMenu(NewPlaylist)

    var $playlistList = $("#playlists ul")
    $playlistList.append(NewPlaylist)

    $input.addClass("set-favorite")


    var Playlist = {
        "index": JsonContent.length,
        "playlistName": playlistName,
        "podcastList": []
    }

    JsonContent.push(Playlist)

    fs.writeFileSync(getPlaylistFilePath(), JSON.stringify(JsonContent))

    showEditPlaylistPage(playlistName)
    $input.val("")

    let title = document.getElementById("content-right").getElementsByTagName("h1")[0].innerHTML
    if(title == generateHtmlTitle("Statistics")) 
        showStatisticsPage()
}
*/

function createNewPlaylist() {
    var $input = $("footer input")
    var playlistName = $input.val().trim()
    if(playlistName == "")
        return;
    allPlaylist.add(playlistName);
    clearTextField($input.get(0));
    showEditPlaylistPage(playlistName);
}

function inputNewPlaylist(_Self, _Event)
{
    if (_Event.code == "Enter") 
        createNewPlaylist(_Self)
    else if (_Event.code == "Escape")
        clearTextField(_Self)
}

function loadPlaylists() {
    allPlaylist = new Playlists();
}

function setContextMenu(_Object)
{
    const {remote}         = require('electron')
    const {Menu, MenuItem} = remote
    const ContextMenu      = new Menu()

    // NOTE: Access input field inside the playlist item to get the name.

    ContextMenu.append(new MenuItem({label: i18n.__('Edit'), click(self) { showEditPlaylistPage($(_Object).attr('playlist')) }}))
    ContextMenu.append(new MenuItem({type: 'separator'}))
    ContextMenu.append(new MenuItem({label: i18n.__('Rename'), click(self) { enableRename(_Object) }}))
    ContextMenu.append(new MenuItem({label: i18n.__('Delete'), click(self) { 
            removePlaylist(_Object);
        }
    }))

    _Object.addEventListener('contextmenu', (_Event) =>
    {
        _Event.preventDefault()
        ContextMenu.popup(remote.getCurrentWindow(), { async:true })
        showPlaylistContent(_Object)
    }, false)
}

// ---------------------------------------------------------------------------------------------------------------------

function enableRename(_Self) {
    var InputField = _Self.getElementsByTagName("input")[0]

    showPlaylistContent(_Self)

    InputField.disabled = false
    InputField.focus()
    InputField.select()
}

function ifRenamePlaylistUpdateUI(_Self) {
    if(_Self.value != "") {
        let $parent = $(_Self).parent(); 
        let index = $parent.attr("index");
        if(allPlaylist.renameByIndex(index, _Self.value))
            setHeader(_Self.value);
        else
            _Self.value = $parent.attr('playlist');
        _Self.disabled = true;
    }
}

function renamePlaylist(_Self, _Event) {
    if (_Event.code == "Enter") {
        ifRenamePlaylistUpdateUI(_Self);
    }
}

function removePlaylist(obj) {
    let index = $(obj).attr('index');
    allPlaylist.removeByIndex(index);
    showNewEpisodesPage();
}
/*
function getPlaylist(_Name)
{
    // TODO: load podcasts associated with this playlist
}
*/
function isInPlaylist(_PlaylistName, _PodcastName) {
    let playlist = allPlaylist.memory.getByName(_PlaylistName);
    return (playlist != undefined && playlist.list.indexOf(_PodcastName) != -1);
}

function getPodcastEditItem(_Name, _Artwork, _IsSet)
{
    let $container = $('<li></li>');
    let checkBox = (_IsSet ? s_CheckBox : s_CheckBoxOutline);
    let $artwork = $('<img />');
    let $name = $('<span></span>');

    // Artwork.src = _Artwork
    $name.html(_Name);

    $container.click(function () {
        togglePodcast(this);
    });
    $container.addClass("podcast-edit-entry")
    $container.html(checkBox);
    $container.append($artwork);
    $container.append($name);

    if (_IsSet) 
        $container.addClass("check");
    else
        $container.addClass("uncheck");

    return $container;
}

function togglePodcast(_Self)
{
    var CheckBox = document.createElement("img")
    CheckBox.innerHTML = s_CheckBox

    var CheckBoxOutline = document.createElement("img")
    CheckBoxOutline.innerHTML = s_CheckBoxOutline

    for (var i = 0; i < _Self.classList.length; i++)
    {
        switch (_Self.classList[i])
        {
            case "check":
                _Self.classList.remove("check")
                _Self.classList.add("uncheck")
                _Self.getElementsByTagName("svg")[0].innerHTML = CheckBoxOutline.getElementsByTagName("svg")[0].innerHTML
                removeFromPlaylist(_Self.parentElement.getElementsByClassName("playlist-edit-input")[0].value, _Self.getElementsByTagName("span")[0].innerHTML)

                break;

            case "uncheck":
                _Self.classList.remove("uncheck")
                _Self.classList.add("check")
                _Self.getElementsByTagName("svg")[0].innerHTML = CheckBox.getElementsByTagName("svg")[0].innerHTML
                addToPlaylist(_Self.parentElement.getElementsByClassName("playlist-edit-input")[0].value, _Self.getElementsByTagName("span")[0].innerHTML)

                break;

            default: break;

        }
    }
}

// ---------------------------------------------------------------------------------------------------------------------
/*
function showEditPage(_Self)
{
    var PlaylistName = _Self.getElementsByTagName("input")[0].value
    var List         = document.getElementById("list")

    setGridLayout(List, false)
    helper.clearContent()
    setHeaderViewAction()
    clearMenuSelection()
    clearTextField(document.getElementById("search-input"))
    clearTextField(document.getElementById("new_list-input"))
    helper.setHeader(generateHtmlTitle("Edit Playlist"))

    _Self.classList.add("selected")

    var NameInput = document.createElement("input")
    NameInput.value = PlaylistName
    NameInput.classList.add("playlist-edit-input")

    NameInput.setAttribute("onkeypress", "matchText(event)")
    NameInput.setAttribute("onkeyup", "renamePlaylist(this, event)")

    var DeleteButton = document.createElement("button")
    DeleteButton.innerHTML = i18n.__("Delete")
    DeleteButton.setAttribute("onclick", "deletePlaylist('" + PlaylistName + "')")

    var HeaderSection = document.createElement("div")
    HeaderSection.classList.add("edit-header")
    HeaderSection.append(NameInput)
    HeaderSection.append(DeleteButton)

    List.append(HeaderSection)

    List.append(getStatisticsElement("statistics-header", "Linked Podcasts", null))

    var JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))
    console.log(JsonContent)
    JsonContent = sortByName(JsonContent)

    for (var i = 0; i < JsonContent.length; i++)
    {
        List.append(getPodcastEditItem(JsonContent[i].collectionName, JsonContent[i].artworkUrl30, isInPlaylist(PlaylistName, JsonContent[i].collectionName)))
    }
}
*/
function showPlaylistContent(_Self)
{
    var PlaylistName = $(_Self).attr('playlist');

    clearBody()

    setHeaderViewAction()
    clearMenuSelection()
    clearTextField(document.getElementById("search-input"))
    clearTextField(document.getElementById("new_list-input"))

    // TODO: header can be a input field as well for playlists
    // TODO: allow inline editing for playlist header

    setHeader(PlaylistName,
    `<span class="edit-playlist-button">
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path d="M0 0h24v24H0z" fill="none"/>
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </svg>
    <span>`
    )

    $('#content-right-header-actions .edit-playlist-button').click(function () {
        let playlist = $(this).parent().parent().find('h1').html();
        showEditPlaylistPage(playlist);
    });

    _Self.classList.add("selected")

    var JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), "utf-8"))

    for (var i = 0; i < JsonContent.length; i++)
    {
        // if (_Self.innerHTML == JsonContent[i].playlistName)
        if (PlaylistName == JsonContent[i].playlistName)
        {
            if (fs.existsSync(getNewEpisodesSaveFilePath()) && fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8") != "")
            {
                var NewEpisodesJsonContent = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8"))
                var List                   = document.getElementById("list")

                setGridLayout(List, false)

                for (var a = 0; a < NewEpisodesJsonContent.length; a++)
                {
                    var Artwork = getValueFromFile(getSaveFilePath, "artworkUrl60", "collectionName", NewEpisodesJsonContent[a].channelName)

                    if (getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", NewEpisodesJsonContent[a].channelName) != undefined && getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", NewEpisodesJsonContent[a].channelName) != "undefined")
                    {
                        Artwork = getValueFromFile(getSaveFilePath, "artworkUrl100", "collectionName", NewEpisodesJsonContent[a].channelName)
                    }

                    if (Artwork != null)
                    {
                        var episodeDescription = NewEpisodesJsonContent[a].episodeDescription.replace(/(<([^>]+)>)/ig, "<tag>").split("<tag>")
                        episodeDescription = NewEpisodesJsonContent[a].episodeDescription[0] != '<' ? episodeDescription[0] : episodeDescription[1]
                        episodeDescription = episodeDescription.replace(/<[^>]*(>|$)|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/g, '')
                        //episodeDescription = episodeDescription.replace(/&nbsp;/g, '')
                        /*
                        var episodeDescription;
                        if(NewEpisodesJsonContent[a].episodeDescription.substr(0, 3) == '<p>') {
                            episodeDescription = document.createElement( 'div' );
                            episodeDescription.innerHTML = NewEpisodesJsonContent[a].episodeDescription
                            episodeDescription = episodeDescription.getElementsByTagName('p')[0].innerHTML
                        } else
                            episodeDescription = NewEpisodesJsonContent[a].episodeDescription
                        */
                        var ListElement = buildListItem(new cListElement(
                            [
                                getImagePart(Artwork),
                                getBoldTextPart(NewEpisodesJsonContent[a].episodeTitle),
                                getSubTextPart((NewEpisodesJsonContent[a].duration == undefined) ? "" : NewEpisodesJsonContent[a].duration),
                                getTextPart(NewEpisodesJsonContent[a].channelName),
                                getDescriptionPart(s_InfoIcon, episodeDescription),
                                getIconButtonPart(s_DeleteIcon)
                            ],
                            "5em 1fr 6em 1fr 5em 5em"
                        ), eLayout.row)

                        if (player.isPlaying(NewEpisodesJsonContent[a].episodeUrl)) 
                            ListElement.classList.add("select-episode")

                        ListElement.setAttribute("onclick", "playNow(this)")
                        ListElement.setAttribute("channel", NewEpisodesJsonContent[a].channelName)
                        ListElement.setAttribute("title", NewEpisodesJsonContent[a].episodeTitle)
                        ListElement.setAttribute("type", NewEpisodesJsonContent[a].episodeType)
                        ListElement.setAttribute("url", NewEpisodesJsonContent[a].episodeUrl)
                        ListElement.setAttribute("length", NewEpisodesJsonContent[a].episodeLength)
                        ListElement.setAttribute("artworkUrl", Artwork)

                        // NOTE: show just episodes of the playlist saved podcast

                        for (var j = 0; j < JsonContent[i].podcastList.length; j++) {
                            if (NewEpisodesJsonContent[a].channelName == JsonContent[i].podcastList[j]) {
                                List.append(ListElement);
                                break;
                            }
                        }
                    }
                }
            }

            break
        }
    }
}

function showEditPlaylistPage(playlist) {

    $playlist = $( 'li[playlist="' + playlist + '"]' )
    console.log($playlist)
    var bodyPage = document.getElementById("list")

    setGridLayout(bodyPage, false)

    var $bodyPage = $(bodyPage);

    clearBody()


    setHeaderViewAction()
    clearMenuSelection()

    clearTextField(document.getElementById("search-input"))
    clearTextField(document.getElementById("new_list-input"))
    
    setHeader(generateHtmlTitle("Set Playlist"),
    `<span class="delete-playlist-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="none" d="M0 0h24v24H0V0z"/>
            <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/>
        </svg>
    </span>`
    )

    $playlist.addClass("selected")


    $bodyPage.html('<div class="edit-header" index="' + $playlist.attr('index') + '">' + 
                        '<input class="playlist-edit-input">' +
                        '<button class="playlist-done-button">' + i18n.__('Done') + '</button>' +
                    '</div>' +
                    '<li class="statistics-header">' +
                        '<div class="statistics-entry-title">' + i18n.__("Linked Podcasts") + '</div>' +
                    '</li>' )
    $('.playlist-edit-input').val(playlist)

    $('.playlist-edit-input').keypress(function (e) {
        matchText(e)
    });

    $('.playlist-edit-input').keyup(function (e) {
        if(e.code == "Enter") {
            let $input = $(this);
            let $parent = $input.parent();

            let index = $parent.attr("index");
            let name = $input.val();

            let $playlistEntry = allPlaylist.ui.getByIndex(index);
            if($playlistEntry.attr('playlist') == name)
                showPlaylistContent($playlistEntry.get(0));
            else if(allPlaylist.renameByIndex(index, name)) {
                $input.removeClass('error-color')
                showPlaylistContent($playlistEntry.get(0));
            } else
                $input.addClass("error-color");
        }
    });

    $('.playlist-done-button').click(function () {
        let $parent = $(this).parent();
        let $input = $parent.find('input');

        let index = $parent.attr("index");
        let name = $input.val();

        let $playlistEntry = allPlaylist.ui.getByIndex(index);
        if($playlistEntry.attr('playlist') == name)
            showPlaylistContent($playlistEntry.get(0));
        else if(allPlaylist.renameByIndex(index, name)) {
            $input.removeClass('error-color')
            showPlaylistContent($playlistEntry.get(0));
        } else
            $input.addClass("error-color");
    })

    $('#content-right-header-actions .delete-playlist-button').click(function () {
        removePlaylist('#list .edit-header');
    })

    let fileContent = ( fs.existsSync(getSaveFilePath()) ? 
        fs.readFileSync(getSaveFilePath(), "utf-8") : ""
    );
    let JsonContent = JSON.parse(fileContent == "" ? "[]": fileContent);

    JsonContent = sortByName(JsonContent)

    for (let i = 0; i < JsonContent.length; i++)
        $bodyPage.append(getPodcastEditItem( JsonContent[i].collectionName, 
                                             JsonContent[i].artworkUrl30, 
                                             isInPlaylist(playlist, JsonContent[i].collectionName)))
}