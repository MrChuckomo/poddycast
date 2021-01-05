class ListUI extends UI {
    constructor(obj) {
        super();
        
        this.dataObject = obj;
        this.firstEpisodeDisplayed = 0;
        this.lastEpisodeDisplayed = null;
        this.bufferSize = 120;
    }

/*
 * LIST
 */

    length() {
        if(this.firstEpisodeDisplayed && this.lastEpisodeDisplayed)
            return (this.lastEpisodeDisplayed - this.firstEpisodeDisplayed + 1);
        return super.length();
    }

    add(episode, i) {
        if(!this.getByEpisodeUrl(episode.episodeUrl).get(0)) {
            if(i < this.firstEpisodeDisplayed) {
                this.firstEpisodeDisplayed++;
                this.lastEpisodeDisplayed++;
            } else if(i <= this.lastEpisodeDisplayed) {
                this.lastEpisodeDisplayed++;

                this.directAdd(episode, i - this.firstEpisodeDisplayed);

                if(this.length() > this.bufferSize)
                    this.removeByEpisodeUrl(this.getLastItemList().attr('url'));
            }
        }
    }


    directAdd(episode, i) {
        let $el = null;
        if(!$(this.getAllItemsList().get(i)).get(0)) {
            if(this.isEmpty())
                clearBody();
            $el = this.getShowMoreEpisodesBottomElement();
        } else
            $el = $(this.getAllItemsList().get(i));
            
        $(this.getNewItemList(episode))
            .hide()
            .css('opacity', 0.0)
            .insertBefore($el)
            .slideDown('slow')
            .animate({opacity: 1.0});
    }

    removeByEpisodeUrl(episodeUrl, feed) {
        if(this.getByEpisodeUrl(episodeUrl).get(0)) {
            this.lastEpisodeDisplayed--;
            let $episodeItem = this.getByEpisodeUrl(episodeUrl);
            
            $episodeItem
                .animate({opacity: 0.0}, 150)
                .slideUp(150, () => { 
                    $episodeItem.remove(); 

                    this.showNothingToShow();
                    
                    if(feed) {
                        let episodeToAdd = feed[this.lastEpisodeDisplayed + 1];
                        if(episodeToAdd) {
                            this.directBottomAdd(episodeToAdd);
                            this.lastEpisodeDisplayed++;
                            if(this.lastEpisodeDisplayed == feed.length - 1)
                                this.getShowMoreEpisodesBottomElement().hide();
                            return;
                        }

                        episodeToAdd = feed[this.firstEpisodeDisplayed - 1];
                        if(episodeToAdd) {
                            this.directTopAdd(episodeToAdd);
                            this.firstEpisodeDisplayed--;
                            if(this.firstEpisodeDisplayed == 0)
                                this.getShowMoreEpisodesTopElement().hide();
                            return;
                        }
                    }
                });
        }
    }
    
    directBottomAdd(episode) {
        $(this.getNewItemList(episode))
            .hide()
            .css('opacity', 0.0)
            .insertAfter(this.getLastItemList())
            .slideDown(150)
            .animate({opacity: 1.0});
    }

    directTopAdd(episode) {
        $(this.getNewItemList(episode))
            .hide()
            .css('opacity', 0.0)
            .insertBefore(this.getFirstItemList())
            .slideDown(150)
            .animate({opacity: 1.0});
    }

    showNothingToShow(_icon, _class) {
        if(this.isEmpty()) 
            setNothingToShowBody(_icon, _class);
    }

    showList(feed) {
        if(feed.length == 0)
            this.showNothingToShow();

        let $list = this.getList();

        let length = (feed.length < this.bufferSize ? feed.length : this.bufferSize);

        for (let i = 0; i < length; i++) 
            $list.append(this.getNewItemList(feed[i]));

        this.firstEpisodeDisplayed = 0;
        this.lastEpisodeDisplayed = length - 1;
        
        this.appendShowMoreEpisodesButton();
        this.prependShowMoreEpisodesButton();

        if(length != feed.length)
            this.getShowMoreEpisodesBottomElement().show();

        setScrollPositionOnTop();
    }

    convertItemIntoInfoItemList(obj) {
    }

    convertInfoItemIntoItemList(obj) {
    }

    getNewItemList(episode) {
    }

    lastEpisodeIsDisplayed(feed) {
        return (this.lastEpisodeDisplayed == feed.length - 1);
    }

    firstEpisodeIsDisplayed() {
        return (this.firstEpisodeDisplayed == 0);
    }

    getShowMoreEpisodesHtml(text, className) {
        if(!className)
            className = '';
        return '<div class="show-more-episodes-row ' + className + '" style="display:none;">' +
                    '<span class="show-more-episodes-button">' +
                        i18n.__(text) + 
                    '</span>' +
                '</div>';
    }

    getShowMoreEpisodesBottomHtml() {
        return this.getShowMoreEpisodesHtml('Show more episodes', 'more-episodes-bottom');
    }

    getShowMoreEpisodesTopHtml() {
        return this.getShowMoreEpisodesHtml('Show more recent episodes', 'more-episodes-top'); 
    }

    getShowMoreEpisodesBottomElement() {
        return this.getList().find('.more-episodes-bottom');
    }

    getShowMoreEpisodesTopElement() {
        return this.getList().find('.more-episodes-top');
    }

    showOther10Elements(feed) {
        let i = this.lastEpisodeDisplayed + 1;
        let delay = 0;
        while(i < feed.length && i < this.lastEpisodeDisplayed + 11) {
            let episode = allFeeds.getEpisodeByEpisodeUrl(feed[i].feedUrl, feed[i].episodeUrl);
            $(this.getNewItemList(episode))
                .delay(140 * delay++)
                .hide()
                .css('opacity', 0.0)
                .insertBefore(this.getShowMoreEpisodesBottomElement())
                .slideDown(100,function () {
                    $(this).animate({opacity: 1.0});
                });

            i++;
        }
        this.lastEpisodeDisplayed = i - 1;
    }


    showsPrevious10Elements(feed) {
        let i = this.firstEpisodeDisplayed - 1;
        let delay = 0;
        while(i >= 0 && i >= this.firstEpisodeDisplayed - 10) {
            let episode = allFeeds.getEpisodeByEpisodeUrl(feed[i].feedUrl, feed[i].episodeUrl);
            $(this.getNewItemList(episode))
                .delay(140 * delay++)
                .hide()
                .css('opacity', 0.0)
                .insertBefore(this.getFirstItemList())
                .slideDown(100, function () {
                    $(this).animate({opacity: 1.0}, 200);
                });
            
            i--;
        }
        this.firstEpisodeDisplayed = i + 1;
    }

    removeExtraPreviousElements() {
        let nElement = this.getAllItemsList().length - this.bufferSize;
        this.getAllItemsList()
            .slice(0, nElement)
            .remove();
        this.firstEpisodeDisplayed += nElement;

        this.getShowMoreEpisodesTopElement().show();
    }

    removeExtraNextElements() {
        let nElement = this.bufferSize - this.getAllItemsList().length;
        this.getAllItemsList()
            .slice(nElement)
            .remove();

        this.lastEpisodeDisplayed += nElement;

        this.getShowMoreEpisodesBottomElement().show();
    }

    appendShowMoreEpisodesButton() {
        this.getList()
            .append(this.getShowMoreEpisodesBottomHtml())

        function clickFunction(obj) {
            let $button = obj.getList().find('.more-episodes-bottom').find('.show-more-episodes-button');
            $button.off('click');
            
            let feed = this.dataObject.getAll();

            obj.showOther10Elements(feed);
            obj.removeExtraPreviousElements();
            console.log("_ ", obj.firstEpisodeDisplayed, obj.lastEpisodeDisplayed)

            if(obj.lastEpisodeIsDisplayed(feed)) {
                let $showMoreEpisodesRowBottom = obj.getShowMoreEpisodesBottomElement();

                $showMoreEpisodesRowBottom
                    .css('opacity', 0.7)
                    .animate({opacity: 0.0}, 150)
                    .slideUp(150, () => { 
                        $showMoreEpisodesRowBottom.hide(); 
                        $showMoreEpisodesRowBottom.css('opacity', ''); 
                        
                        $button.click(() => {
                            clickFunction(obj);
                        });
                    });
            } else {
                $button.click(() => {
                    clickFunction(obj);
                });
            }
        }

        this.getList().find('.more-episodes-bottom').find('.show-more-episodes-button')
            .click(() => {
                clickFunction(this);
            });
    }

    prependShowMoreEpisodesButton() {
        this.getList()
            .prepend(this.getShowMoreEpisodesTopHtml())

        function clickFunction(obj) {
            let $button = obj.getList().find('.more-episodes-top').find('.show-more-episodes-button');
            $button.off('click');
            
            let feed = this.dataObject.getAll();

            obj.showsPrevious10Elements(feed);
            let timeout = 130 * (obj.getAllItemsList().length - obj.bufferSize);
            obj.removeExtraNextElements();
            console.log("^", obj.firstEpisodeDisplayed, obj.lastEpisodeDisplayed)
            
            if(obj.firstEpisodeIsDisplayed()) {
                let $showMoreEpisodesRowTop = obj.getShowMoreEpisodesTopElement();
                
                $showMoreEpisodesRowTop
                    .css('opacity', 0.7)
                    .animate({opacity: 0.0}, 150)
                    .slideUp(150, () => { 
                        $showMoreEpisodesRowTop.hide(); 
                        $showMoreEpisodesRowTop.css('opacity', ''); 

                        setTimeout(() => {
                            $button.click(() => {
                                clickFunction(obj);
                            });
                        }, timeout);
                    });
            } else {
                setTimeout(() => {
                    $button.click(() => {
                        clickFunction(obj);
                    });
                }, timeout);
            }
        }

        this.getList().find('.more-episodes-top').find('.show-more-episodes-button')
            .click(() => {
                clickFunction(this);
            });
    }
}
/*
function getEpisodeClassFromAttr(obj) {
    let $obj = $(obj);
    return new Episode(
        $obj.attr('channel'),
        $obj.attr('feedUrl'),
        $obj.attr('title'),
        $obj.attr('url'),
        $obj.attr('type'),
        $obj.attr('length'),
        $obj.attr('description'),
        $obj.attr('durationkey'),
        $obj.attr('pubdate')
    );
}
*/