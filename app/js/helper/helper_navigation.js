'use strict'

// ---------------------------------------------------------------------------------------------------------------------
// LEFT COLUMN
// ---------------------------------------------------------------------------------------------------------------------

function setItemCounts() {
    let NewEpisodesCount = document.getElementById('menu-episodes').getElementsByClassName('menu-count')[0]

    if (fs.existsSync(getPlaylistFilePath()) && fs.readFileSync(getNewEpisodesSaveFilePath(), 'utf-8') !== '') {
        NewEpisodesCount.innerHTML = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), 'utf-8')).length
    } else {
        NewEpisodesCount.innerHTML = 0
    }

    let FavoritesCount = document.getElementById('menu-favorites').getElementsByClassName('menu-count')[0]

    if (fs.existsSync(getPlaylistFilePath()) && fs.readFileSync(getSaveFilePath(), 'utf-8') !== '') {
        FavoritesCount.innerHTML = JSON.parse(fs.readFileSync(getSaveFilePath(), 'utf-8')).length
    } else {
        FavoritesCount.innerHTML = 0
    }
}

function clearPlaylists() {
    let AllInputFields = document.getElementById('playlists').getElementsByTagName('input')

    for (let i = 0; i < AllInputFields.length; i++) {
        if (!AllInputFields[i].disabled) {
            clearRenameFocus(AllInputFields[i])
        }
    }
}

function clearRenameFocus(_Self) {
    if (_Self.value === '') {
        let HeaderName = document.getElementById('content-right-header').getElementsByTagName('h1')[0].innerHTML

        _Self.value = HeaderName
    }

    renamePlaylistInline(_Self)
}

function renamePlaylistInline(_Self) {
    if (_Self.value !== null && _Self.value !== '') {
        let HeaderName = document.getElementById('content-right-header').getElementsByTagName('h1')[0].innerHTML
        let NewName = _Self.value

        setPlaylistName(HeaderName, NewName)
        showPlaylistContent(_Self.parentElement)

        _Self.disabled = true
    }
}

function renamePlaylistInEdit(_Self) {
    if (_Self.value !== null && _Self.value !== '') {
        let SelectionName = document.getElementById('playlists').getElementsByClassName('selected')[0].getElementsByTagName('input')[0].value
        let NewName = _Self.value

        setPlaylistName(SelectionName, NewName)
        document.getElementById('playlists').getElementsByClassName('selected')[0].getElementsByTagName('input')[0].value = NewName
        _Self.parentElement.getElementsByTagName('button')[0].setAttribute('onclick', 'deletePlaylist("' + NewName + '")')
    }
}

function setPlaylistName(_OldName, _NewName) {
    if (fs.existsSync(getPlaylistFilePath()) && fs.readFileSync(getPlaylistFilePath(), 'utf-8') !== '') {
        JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), 'utf-8'))

        for (let i = 0; i < JsonContent.length; i++) {
            if (JsonContent[i].playlistName === _OldName) {
                JsonContent[i].playlistName = _NewName
                break
            }
        }

        fs.writeFileSync(getPlaylistFilePath(), JSON.stringify(JsonContent))
    }
}

function setGridLayout(_List, _Enable) {
    if (_Enable) {
        _List.classList.add('grid-layout')
    } else {
        _List.classList.remove('grid-layout')
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// RIGHT COLUMN
// ---------------------------------------------------------------------------------------------------------------------

function setHeaderViewAction(_Mode) {
    switch (_Mode) {
    case 'list':
        document.getElementById('content-right-header-actions').innerHTML = s_ListView
        document.getElementById('content-right-header-actions').getElementsByTagName('svg')[0].setAttribute('onclick', 'toggleList("list")')
        break;

    case 'grid':
        document.getElementById('content-right-header-actions').innerHTML = s_GridView
        document.getElementById('content-right-header-actions').getElementsByTagName('svg')[0].setAttribute('onclick', 'toggleList("grid")')
        break;

    default: document.getElementById('content-right-header-actions').innerHTML = ''; break;
    }
}

function toggleList(_View) {
    let List = document.getElementById('list')
    switch (_View) {
    case 'list':
        setGridLayout(List, false)
        setHeaderViewAction('grid')
        break;

    case 'grid':
        setGridLayout(List, true)
        setHeaderViewAction('list')
        break;

    default: break;
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// MENU & PLAYLISTS
// ---------------------------------------------------------------------------------------------------------------------

function clearMenuSelection() {
    let Menu = document.getElementById('menu')
    let ListItems = Menu.getElementsByTagName('li')
    let Playlists = document.getElementById('playlists').getElementsByTagName('li')

    for (let i = 0; i < ListItems.length; i++) {
        ListItems[i].classList.remove('selected')
    }

    for (let i = 0; i < Playlists.length; i++) {
        Playlists[i].classList.remove('selected')
    }
}


function dragToPlaylist(_PlaylistName, _PodcastName) {
    addToPlaylist(_PlaylistName, _PodcastName)
}

function addToPlaylist(_PlaylistName, _PodcastName) {
    let JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), 'utf-8'))

    for (let i = 0; i < JsonContent.length; i++) {
        if (JsonContent[i].playlistName === _PlaylistName) {
            let PodcastList = JsonContent[i].podcastList

            if (!isAlreadyInPlaylist(_PlaylistName, _PodcastName)) {
                PodcastList.push(_PodcastName)
            }
            break
        }
    }

    fs.writeFileSync(getPlaylistFilePath(), JSON.stringify(JsonContent))
}

function removeFromPlaylist(_PlaylistName, _PodcastName) {
    let JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), 'utf-8'))

    for (let i = 0; i < JsonContent.length; i++) {
        if (JsonContent[i].playlistName === _PlaylistName) {
            let PodcastList = JsonContent[i].podcastList

            if (isAlreadyInPlaylist(_PlaylistName, _PodcastName)) {
                for (let j = PodcastList.length - 1; j >= 0 ; j--) {
                    if(PodcastList[j] === _PodcastName) {
                        PodcastList.splice(j, 1)
                    }
                }
            }

            break
        }
    }

    fs.writeFileSync(getPlaylistFilePath(), JSON.stringify(JsonContent))
}

function deletePlaylist(_PlaylistName) {
    let JsonContent = JSON.parse(fs.readFileSync(getPlaylistFilePath(), 'utf-8'))

    for (let i = 0; i < JsonContent.length; i++) {
        if (_PlaylistName === JsonContent[i].playlistName) {
            JsonContent.splice(i, 1)
            break
        }
    }

    fs.writeFileSync(getPlaylistFilePath(), JSON.stringify(JsonContent))

    // TODO: clean remove
    // TODO: do not simply reload the whole app

    location.reload()
}
