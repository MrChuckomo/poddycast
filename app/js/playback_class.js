/*
setTimeout(function() { 
    alert("Hello"); 
}, 30 * 1000);
*/

class PlaybackUI {
    constructor() {
    }

    get(episodeUrl) {
        return $('li[url="' + episodeUrl + '"]');
    }

    update(episodeUrl) {
        this.updateDone(episodeUrl);
    }

    updateDone(episodeUrl) {
        let obj = allFeeds.playback.data[episodeUrl];
        let $element = this.get(episodeUrl);
        if(obj.done)
            $element.find('.list-item-flag').css('opacity', 1.0);
        else
            $element.find('.list-item-flag').css('opacity', 0.0);
    }
}

class Playback {
    constructor() {
        this.load();
        this.ui = new PlaybackUI();
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

    alwaysSetPosition(feedUrl, episodeUrl, position) {
        if(!this.exists(episodeUrl))
            this.unsafeAdd(feedUrl, episodeUrl)
        this.data[episodeUrl].position = position;
        this.update();
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