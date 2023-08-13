'use strict';

class Episode {
    constructor(channelName, title, description, length, type, url, duration) {
        this.channelName = channelName;
        this.title = title;
        this.description = description;
        this.length = length;
        this.type = type;
        this.url = url;
        this.duration = duration;
        this.playbackPosition = 0;
    }

    toJSON() {
        return {
            'channelName': this.channelName,
            'episodeTitle': this.title,
            'episodeDescription': this.description,
            'episodeLength': this.length,
            'episodeType': this.type,
            'episodeUrl': this.url,
            'duration': this.duration,
            'playbackPosition': this.playbackPosition
        };
    }
}
module.exports.Episode = Episode;
