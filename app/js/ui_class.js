class UI {
    constructor() {
    }

/*
 * PAGE
 */

    getPageType() {
        if(!notPlaylistHeader())
            return 'playlist';
        if(getHeader() == generateHtmlTitle('New Episodes'))
            return 'newEpisodes';
        if((getHeader() == generateHtmlTitle('Favorites')))
            return 'favorites';
        if(getHeader() == generateHtmlTitle('Archive'))
            return 'archive';
        return undefined;
    }

/*
 * LIST
 */

    length() {
        return this.getAllItemsList().length;
    }

    isEmpty() {
        return !Boolean(this.getAllItemsList().get(0));
    }

    getList() {
        return $('#list');
    }

    getAllItemsList() {
        return $('#list li');
    }

    getFirstItemList() {
        return $(this.getAllItemsList().get(0));
    }

    getLastItemList() {
        let $itemList = this.getAllItemsList();
        return $($itemList.get($itemList.length - 1));
    }

    getItemListByIndex(i) {
        return $(this.getAllItemsList().get(i));
    }

    getByEpisodeUrl(episodeUrl) {
        return this.getAllItemsList().filter('[url="' + episodeUrl + '"]');
    }
}