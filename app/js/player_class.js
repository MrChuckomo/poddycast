var playerManager = null;

class PlayerManager extends UI {
    constructor() {
        super();

        this.$player = $('#player').get(0);
        this.$source = $(this.$player).find('source');

        this.$playPauseButton = $('#play-pause');
        this.$forwardButton = $('#forward-30-sec');
        this.$replyButton = $('#replay-30-sec');

        this.$duration = $('#content-right-player-duration');
        this.$currentTime = $('#content-right-player-time');
        this.$artwork = $('#content-right-player-img');
        this.$title = $('#content-right-player-title');
        this.$rate = $('#content-right-player-speed-indicator').get(0);
        
        this.slider = new Slider($('#slider'));

        this.episodePlaying = null;
        this.queue = null;

        this.initActions();
    }

    initActions() {
        $('#content-right-player-speed-down').click(() => {
            this.speedDown();
        })

        $('#content-right-player-speed-up').click(() => {
            this.speedUp();
        })

        $('.content-right-player-speed-btn').on('wheel', function(event){
            setSpeedWithWheelMouse(event);
        });
        
        this.$replyButton.click(() => this.reply())
        this.$playPauseButton.click(() => this.togglePlayPause())
        this.$forwardButton.click(() => this.forward())
    }

    startsPlaying(feedUrl, episodeUrl, dontChangeQueue) {
        this.removeInitialOpacityPlayerButtons();
        this.setEpisodePlaying(feedUrl, episodeUrl);

        this.selectEpisode(episodeUrl);
        this.setSource();

        if(!dontChangeQueue)
            this.queue = this.getPageType();

        this.$player.load();
        this.$player.currentTime = this.getPlaybackPosition();
        this.$player.addEventListener('timeupdate', () => {
            if (parseInt(this.getCurrentTime()) % 10 == 0)
                this.savePlaybackPosition();

            if(this.$player.ended) {
                let feedUrl = this.episodePlaying.feedUrl;
                let episodeUrl = this.episodePlaying.episodeUrl;
                this.next();
                allNewEpisodes.removeByEpisodeUrl(episodeUrl);
                allFeeds.setPlaybackDoneByEpisodeUrl(feedUrl, episodeUrl, true);
                return;
            }

            let value = null;
            if(this.getCurrentTime() > 0)
                value = Math.floor((100 / this.getDuration()) * this.getCurrentTime());
            else
                value = 0;
            
            this.slider.setValue(value);
            this.updateCurrentTimeHtml();
            this.updateDurationHtml();
        }, false);

        this.setArtworkHtml();
        this.setTitleHtml();

        setTitle(this.episodePlaying.episodeTitle);
        this.play();
        this.setNavigator();
    }

    play() {
        this.$playPauseButton
            .stop()
            .fadeTo(100, 0.3,
                    () => {
                        this.$playPauseButton
                            .html($(s_PauseIcon).html())
                            .fadeTo(80, 0.65, () => {
                                this.$playPauseButton
                                    .removeAttr('style');
                            })
            })
        this.$playPauseButton.attr('mode', 'pause');

        this.$player.play();
        navigator.mediaSession.playbackState = "playing";
    }

    pause() {
        this.$playPauseButton
            .stop()
            .fadeTo(100, 0.3,
                    () => {
                        this.$playPauseButton
                            .html($(s_PlayIcon).html())
                            .fadeTo(80, 0.65, () => {
                                this.$playPauseButton
                                    .removeAttr('style');
                            })
            })
        this.$playPauseButton.attr('mode', 'play');

        this.$player.pause();
        navigator.mediaSession.playbackState = "paused";
    }

    setNavigator() {
        if ('mediaSession' in navigator) {
            let title = this.episodePlaying.episodeTitle;
            let artist = this.episodePlaying.channelName;
            let album = this.episodePlaying.pubDate;
            let artwork = this.episodePlaying._artwork;

            navigator.mediaSession.metadata = new MediaMetadata({
                title: title,
                artist: artist,
                album: album,
                artwork: [
                    {
                        src: artwork,
                        sizes: '512x512',
                        type: 'image/jpg'
                    }
                ]
            });

            navigator.mediaSession.setActionHandler('play', async () => {
                console.log('> User clicked "Play" icon.');
                this.play();
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                console.log('> User clicked "Pause" icon.');
                this.pause();
            });

            navigator.mediaSession.setActionHandler("previoustrack", (details) => {
                this.reply();
            });

            navigator.mediaSession.setActionHandler("nexttrack", (details) => {
                this.forward();
            });
        }
    }

    isSet() {
        return Boolean(this.$source.attr('src'));
    }

    isPlaying(episodeUrl) {
        if(!this.episodePlaying)
            return false;
        return (episodeUrl == this.episodePlaying.episodeUrl);
    }

    forward() {
        if(this.isSet()) {
            this.$player.currentTime += 30;
            this.$forwardButton.animateRotate(360, 900);
        }
    }

    reply() {
        if(this.isSet()) {
            this.$player.currentTime -= 30;
            this.$replyButton.animateRotate(-360, 900);
        }
    }

    speedUp() {
        switch (this.$rate.innerHTML) {
            case "0.5x": this.$rate.innerHTML = "0.6x"; this.$player.playbackRate = 0.6; this.$player.defaultPlaybackRate = 0.6 ; break;
            case "0.6x": this.$rate.innerHTML = "0.7x"; this.$player.playbackRate = 0.7; this.$player.defaultPlaybackRate = 0.7 ; break;
            case "0.7x": this.$rate.innerHTML = "0.8x"; this.$player.playbackRate = 0.8; this.$player.defaultPlaybackRate = 0.8 ; break;
            case "0.8x": this.$rate.innerHTML = "0.9x"; this.$player.playbackRate = 0.9; this.$player.defaultPlaybackRate = 0.9 ; break;
            case "0.9x": this.$rate.innerHTML = "1.0x"; this.$player.playbackRate = 1.0; this.$player.defaultPlaybackRate = 1.0 ; break;
            case "1.0x": this.$rate.innerHTML = "1.1x"; this.$player.playbackRate = 1.1; this.$player.defaultPlaybackRate = 1.1 ; break;
            case "1.1x": this.$rate.innerHTML = "1.2x"; this.$player.playbackRate = 1.2; this.$player.defaultPlaybackRate = 1.2 ; break;
            case "1.2x": this.$rate.innerHTML = "1.3x"; this.$player.playbackRate = 1.3; this.$player.defaultPlaybackRate = 1.3 ; break;
            case "1.3x": this.$rate.innerHTML = "1.5x"; this.$player.playbackRate = 1.5; this.$player.defaultPlaybackRate = 1.5 ; break;
            case "1.5x": this.$rate.innerHTML = "1.7x"; this.$player.playbackRate = 1.7; this.$player.defaultPlaybackRate = 1.7 ; break;
            case "1.7x": this.$rate.innerHTML = "2.0x"; this.$player.playbackRate = 2.0; this.$player.defaultPlaybackRate = 2.0 ; break;
            case "2.0x": this.$rate.innerHTML = "2.1x"; this.$player.playbackRate = 2.1; this.$player.defaultPlaybackRate = 2.1 ; break;
            case "2.1x": this.$rate.innerHTML = "2.2x"; this.$player.playbackRate = 2.2; this.$player.defaultPlaybackRate = 2.2 ; break;
            case "2.2x": this.$rate.innerHTML = "2.3x"; this.$player.playbackRate = 2.3; this.$player.defaultPlaybackRate = 2.3 ; break;
            case "2.3x": this.$rate.innerHTML = "2.5x"; this.$player.playbackRate = 2.5; this.$player.defaultPlaybackRate = 2.5 ; break;
            case "2.5x": this.$rate.innerHTML = "2.7x"; this.$player.playbackRate = 2.7; this.$player.defaultPlaybackRate = 2.7 ; break;
            case "2.7x": this.$rate.innerHTML = "3.0x"; this.$player.playbackRate = 3.0; this.$player.defaultPlaybackRate = 3.0 ; break;
            case "3.0x": this.$rate.innerHTML = "3.1x"; this.$player.playbackRate = 3.1; this.$player.defaultPlaybackRate = 3.1 ; break;
            case "3.1x": this.$rate.innerHTML = "3.2x"; this.$player.playbackRate = 3.2; this.$player.defaultPlaybackRate = 3.2 ; break;
            case "3.2x": this.$rate.innerHTML = "3.3x"; this.$player.playbackRate = 3.3; this.$player.defaultPlaybackRate = 3.3 ; break;
            case "3.3x": this.$rate.innerHTML = "3.5x"; this.$player.playbackRate = 3.5; this.$player.defaultPlaybackRate = 3.5 ; break;
            case "3.5x": this.$rate.innerHTML = "3.7x"; this.$player.playbackRate = 3.7; this.$player.defaultPlaybackRate = 3.7 ; break;
            case "3.7x": this.$rate.innerHTML = "4.0x"; this.$player.playbackRate = 4.0; this.$player.defaultPlaybackRate = 4.0 ; break;
            case "4.0x": this.$rate.innerHTML = "0.5x"; this.$player.playbackRate = 0.5; this.$player.defaultPlaybackRate = 0.5 ; break;
            default: break;
        }
    }

    speedDown() {
        switch (this.$rate.innerHTML) {
            case "4.0x": this.$rate.innerHTML = "3.7x"; this.$player.playbackRate = 3.7; this.$player.defaultPlaybackRate = 3.7 ; break;
            case "3.7x": this.$rate.innerHTML = "3.5x"; this.$player.playbackRate = 3.5; this.$player.defaultPlaybackRate = 3.5 ; break;
            case "3.5x": this.$rate.innerHTML = "3.3x"; this.$player.playbackRate = 3.3; this.$player.defaultPlaybackRate = 3.3 ; break;
            case "3.3x": this.$rate.innerHTML = "3.2x"; this.$player.playbackRate = 3.2; this.$player.defaultPlaybackRate = 3.2 ; break;
            case "3.2x": this.$rate.innerHTML = "3.1x"; this.$player.playbackRate = 3.1; this.$player.defaultPlaybackRate = 3.1 ; break;
            case "3.1x": this.$rate.innerHTML = "3.0x"; this.$player.playbackRate = 3.0; this.$player.defaultPlaybackRate = 3.0 ; break;
            case "3.0x": this.$rate.innerHTML = "2.7x"; this.$player.playbackRate = 2.7; this.$player.defaultPlaybackRate = 2.7 ; break;
            case "2.7x": this.$rate.innerHTML = "2.5x"; this.$player.playbackRate = 2.5; this.$player.defaultPlaybackRate = 2.5 ; break;
            case "2.5x": this.$rate.innerHTML = "2.3x"; this.$player.playbackRate = 2.3; this.$player.defaultPlaybackRate = 2.3 ; break;
            case "2.3x": this.$rate.innerHTML = "2.2x"; this.$player.playbackRate = 2.2; this.$player.defaultPlaybackRate = 2.2 ; break;
            case "2.2x": this.$rate.innerHTML = "2.1x"; this.$player.playbackRate = 2.1; this.$player.defaultPlaybackRate = 2.1 ; break;
            case "2.1x": this.$rate.innerHTML = "2.0x"; this.$player.playbackRate = 2.0; this.$player.defaultPlaybackRate = 2.0 ; break;
            case "2.0x": this.$rate.innerHTML = "1.7x"; this.$player.playbackRate = 1.7; this.$player.defaultPlaybackRate = 1.7 ; break;
            case "1.7x": this.$rate.innerHTML = "1.5x"; this.$player.playbackRate = 1.5; this.$player.defaultPlaybackRate = 1.5 ; break;
            case "1.5x": this.$rate.innerHTML = "1.3x"; this.$player.playbackRate = 1.3; this.$player.defaultPlaybackRate = 1.3 ; break;
            case "1.3x": this.$rate.innerHTML = "1.2x"; this.$player.playbackRate = 1.2; this.$player.defaultPlaybackRate = 1.2 ; break;
            case "1.2x": this.$rate.innerHTML = "1.1x"; this.$player.playbackRate = 1.1; this.$player.defaultPlaybackRate = 1.1 ; break;
            case "1.1x": this.$rate.innerHTML = "1.0x"; this.$player.playbackRate = 1.0; this.$player.defaultPlaybackRate = 1.0 ; break;
            case "1.0x": this.$rate.innerHTML = "0.9x"; this.$player.playbackRate = 0.9; this.$player.defaultPlaybackRate = 0.9 ; break;
            case "0.9x": this.$rate.innerHTML = "0.8x"; this.$player.playbackRate = 0.8; this.$player.defaultPlaybackRate = 0.8 ; break;
            case "0.8x": this.$rate.innerHTML = "0.7x"; this.$player.playbackRate = 0.7; this.$player.defaultPlaybackRate = 0.7 ; break;
            case "0.7x": this.$rate.innerHTML = "0.6x"; this.$player.playbackRate = 0.6; this.$player.defaultPlaybackRate = 0.6 ; break;
            case "0.6x": this.$rate.innerHTML = "0.5x"; this.$player.playbackRate = 0.5; this.$player.defaultPlaybackRate = 0.5 ; break;
            case "0.5x": this.$rate.innerHTML = "4.0x"; this.$player.playbackRate = 4.0; this.$player.defaultPlaybackRate = 4.0 ; break;
            
            default: break;
        }
    }

    next() {
        let feed = null;
        let index = null;

        switch(this.queue) {
            case 'playlist':
                let playlistName = getHeader();
                feed = allNewEpisodes.getPlaylistEpisodes(playlistName);
                break;
            case 'newEpisodes':
                feed = allNewEpisodes.getAll();
                break;
            case 'favorites':
                feed = allFeeds.getFeedPodcast(this.episodePlaying.feedUrl);
                break;
            case 'archive':
                feed = allArchiveEpisodes.getAll();
                break;
        }

        if(feed)
            index = feed.map(e => e.episodeUrl).indexOf(this.episodePlaying.episodeUrl);

        if(index && index > 0) {
            index--;
            this.startsPlaying(feed[index].feedUrl, feed[index].episodeUrl, true);
            return
        }

        this.pause();

    }

    getDuration() {
        return this.$player.duration;
    }

    getCurrentTime() {
        return this.$player.currentTime;
    }

    setCurrentTime(value) {
        this.$player.currentTime = (value / 100) * this.getDuration();
        this.savePlaybackPosition();
    }

    setSource() {
        this.$source
            //.attr('channel', this.episodePlaying.channelName)
            //.attr('feedUrl', this.episodePlaying.feedUrl)
            .attr('src', this.episodePlaying.episodeUrl)
            //.attr('type', this.episodePlaying.episodeType);
    }

    setArtworkHtml() {
        this.$artwork.attr('src', this.episodePlaying._artwork);
    }

    setTitleHtml() {
        this.$title.html(this.episodePlaying.episodeTitle);
    }

    getSelectedEpisode() {
        return this.getAllItemsList()
                    .filter('.select-episode');
    }

    selectEpisode(episodeUrl) {
        this.getSelectedEpisode()
            .removeClass('select-episode');
        
        this.getByEpisodeUrl(episodeUrl)
            .addClass('select-episode');
    }

    setEpisodePlaying(feedUrl, episodeUrl) {
        this.episodePlaying = { ...allFeeds.getEpisodeByEpisodeUrl(feedUrl, episodeUrl) };
        this.episodePlaying._artwork = getBestArtworkUrl(feedUrl);
        return this.episodePlaying;
    }

    savePlaybackPosition() {
        if(this.episodePlaying)
            allFeeds.setPlaybackPositionByEpisodeUrl(this.episodePlaying.feedUrl, this.episodePlaying.episodeUrl, this.getCurrentTime());
    }

    getPlaybackPosition() {
        if(this.episodePlaying) {
            let playbackPosition = allFeeds.getPlaybackPositionByEpisodeUrl(this.episodePlaying.episodeUrl);
            if(playbackPosition)
                return playbackPosition;
        }
        return 0;
    }

    updateDurationHtml() {
        let time = getFullTime(Math.floor(this.getDuration()));
        
        let getPrettyTime = function (_Time) {
            return ((_Time < 10) ? "0" + _Time : _Time)
        }
        
        if (!isNaN(time.minutes))
            this.$duration.html(getPrettyTime(time.hours) + ":" + 
                                getPrettyTime(time.minutes) + ":" + 
                                getPrettyTime(time.seconds));
    }

    updateCurrentTimeHtml() {
        let time = getFullTime(Math.floor(this.getCurrentTime()));
        
        let getPrettyTime = function (_Time) {
            return ((_Time < 10) ? "0" + _Time : _Time)
        }
        
        if (!isNaN(time.minutes)) 
            this.$currentTime.html(getPrettyTime(time.hours) + ":" + 
                                   getPrettyTime(time.minutes) + ":" + 
                                   getPrettyTime(time.seconds));
    }

    togglePlayPause() {
        if(this.isSet()) {
            if (this.$playPauseButton.attr('mode') == "play")
                this.play();
            else
                this.pause();
        }
    }

    removeInitialOpacityPlayerButtons() {
        this.$replyButton.removeAttr('style');
        this.$playPauseButton.removeAttr('style');
        this.$forwardButton.removeAttr('style');
        this.$artwork.removeAttr('style');
    }
}

function loadPlayerManager() {
    playerManager = new PlayerManager();
}

function setSpeedWithWheelMouse(e) {
    if(e.originalEvent.deltaY < 0)
        playerManager.speedUp();
    else 
        playerManager.speedDown();
}