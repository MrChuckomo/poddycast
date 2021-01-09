class PlaybackUI extends UI {
    constructor(obj) {
        super();
        this.dataObject = obj;
    }
    
    update(episodeUrl) {
        this.updateDone(episodeUrl);
    }

    updateDone(episodeUrl) {
        this.getByEpisodeUrl(episodeUrl).find('.list-item-flag')
                                        .css('--percentage', '100%')
                                        .css('--bk-color1-flag', '#798')
                                        .html('Done');
    }

    getProgressionFlag(episodeUrl) {
        let done = this.dataObject.getDone(episodeUrl);
        if(done)
            return getFlagPart('Done')
                    .css('--percentage', '100%')
                    .css('--bk-color1-flag', '#798')
                    .get(0);

        let duration = this.dataObject.getDuration(episodeUrl);
        if(duration == null || duration == undefined || duration < 0)
            return getFlagPart('0%').css('--percentage', '0%').get(0);
        
        let position = this.dataObject.getPosition(episodeUrl);
        let percentage = getPercentage(position, duration) + '%'; 
        return getFlagPart(percentage).css('--percentage', percentage).get(0); 
    }

    updatePosition(episodeUrl, position) {
        if(!Number.isNaN(position) && !this.dataObject.getDone(episodeUrl)) {
            let percentage = position + '%';
            this.getByEpisodeUrl(episodeUrl).find('.list-item-flag')
                                            .css('--percentage', percentage)
                                            .html(percentage);
        }
    }

}

class Playback {
    constructor() {
        this.load();
        this.ui = new PlaybackUI(this);
        this.bufferSize = -1000;
    }

    load() {
        if (!fs.existsSync(getPlaybackSaveFilePath()))
            fs.openSync(getPlaybackSaveFilePath(), 'w');
            
        let fileContent = ifExistsReadFile(getPlaybackSaveFilePath());
        this.data = JSON.parse(fileContent == "" ? "{}": fileContent);
    }

    update() {
        fs.writeFileSync(getPlaybackSaveFilePath(), JSON.stringify(this.data, null, "\t"));
    }

    exists(episodeUrl) {
        return Boolean(this.data[episodeUrl]);
    }

    length() {
        Object.keys(this.data).length;
    }

    add(feedUrl, episodeUrl) {
        if(!this.exists(episodeUrl)) {
            this.unsafeAdd(feedUrl, episodeUrl);
            this.update();
            return true;
        }
        return false;
    }
    
    unsafeAdd(feedUrl, episodeUrl) {
        if(!this.exists(episodeUrl)) {
            this.data[episodeUrl] = {
                feedUrl: feedUrl, 
                position: 0,
                duration: -1,
                done: false
            };
            if(this.length() > this.bufferSize)  // limitation canceled, buffer size is a negative number
                this.unsafeRemoveOlder();
            return true;
        }
        return false;
    }

    get(episodeUrl) {
        return this.data[episodeUrl];
    }

    getPosition(episodeUrl) {
        let playback = this.get(episodeUrl);
        if(!playback)
            return 0;
        return playback.position;
    }

    getDuration(episodeUrl) {
        let playback = this.get(episodeUrl);
        if(!playback)
            return -1;
        return playback.duration;
    }

    getDone(episodeUrl) {
        let playback = this.get(episodeUrl);
        if(!playback)
            return false;
        return Boolean(playback.done);
    }

    alwaysGet(feedUrl, episodeUrl) {
        if(!this.exists(episodeUrl))
            this.add(feedUrl, episodeUrl)
        return this.data[episodeUrl];
    }

    unsafeSet(episodeUrl, obj) {
        if(this.exists(episodeUrl)) {
            this.data[episodeUrl] = obj;
            return true;
        }
        return false;
    }

    set(episodeUrl, obj) {
        if(this.unsafeSet(episodeUrl, obj)) {
            this.update();
            this.ui.update(episodeUrl);
            return true;
        }
        return false;
    }

    setPosition(episodeUrl, position) {
        if(this.exists(episodeUrl)) {
            this.data[episodeUrl].position = position;
            this.update();
            return true;
        }
        return false;
    }

    setDuration(episodeUrl, duration) {
        if(this.exists(episodeUrl)) {
            this.data[episodeUrl].duration = duration;
            this.update();
            return true;
        }
        return false;
    }

    setDone(episodeUrl, done) {
        if(this.exists(episodeUrl)) {
            this.data[episodeUrl].done = done;
            this.update();
            this.ui.updateDone(episodeUrl);
            return true;
        }
        return false;
    }

    alwaysSet(episodeUrl, obj) {
        this.data[episodeUrl] = obj;
        this.update();
        this.ui.update(episodeUrl);
    }

    alwaysSetPositionAndDuration(feedUrl, episodeUrl, position, duration) {
        if(!this.exists(episodeUrl))
            this.unsafeAdd(feedUrl, episodeUrl)
        this.data[episodeUrl].position = position;
        if(!this.data[episodeUrl].duration || duration)
            this.data[episodeUrl].duration = duration;
        this.update();
        //if(!this.data[episodeUrl].done)
        this.ui.updatePosition(episodeUrl, getPercentage(position, duration));
    }

    alwaysSetDone(feedUrl, episodeUrl, done) {
        if(!this.exists(episodeUrl))
            this.unsafeAdd(feedUrl, episodeUrl)
        this.data[episodeUrl].done = done;
        this.update();
        this.ui.updateDone(episodeUrl);
    }

    remove(episodeUrl) {
        if(this.exists(episodeUrl)) {
            this.unsafeRemove(episodeUrl);
            this.update();
            return true;
        }
        return false;
    }

    removeOlder() {
        let episodeUrl = Object.keys(this.data)[0];
        return this.remove(episodeUrl);
    }

    unsafeRemove(episodeUrl) {
        if(this.exists(episodeUrl)) {
            delete this.data[episodeUrl];
            return true;
        }
        return false;
    }

    unsafeRemoveOlder() {
        let episodeUrl = Object.keys(this.data)[0];
        return this.unsafeRemove(episodeUrl);
    }

    removeAllDataPodcast(feedUrl) {
        let updated = false;
        for(let episodeUrl in this.data)
            if(this.data[episodeUrl].feedUrl == feedUrl) {
                this.unsafeRemove(episodeUrl);
                updated = true;
            }
        if(updated)
            this.update();
    }
}

function getPercentage(position, duration) {
    return Math.floor((position / duration) * 100);
}