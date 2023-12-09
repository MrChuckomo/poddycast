'use strict';

class Episode {
    constructor(channelName, title, description, length, type, url, episodeImage, duration) {
        this.channelName = channelName;
        this.title = title;
        this.description = description;
        this.length = length;
        this.type = type;
        this.url = url;
        this.image = episodeImage;
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
            'episodeImage': this.image,
            'duration': this.duration,
            'playbackPosition': this.playbackPosition
        };
    }
}
module.exports.Episode = Episode;
