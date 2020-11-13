importScripts('./lib/jsdom.js')

class Episode {
    constructor(ChannelName, FeedUrl, EpisodeTitle, EpisodeUrl, EpisodeType, EpisodeLength, EpisodeDescription, DurationKey, pubDate, playbackPosition) {
        this.channelName = ChannelName;
        this.feedUrl = FeedUrl;
        this.episodeTitle = EpisodeTitle;
        this.episodeUrl = EpisodeUrl;
        this.episodeType = EpisodeType;
        this.episodeLength = EpisodeLength;
        this.episodeDescription = EpisodeDescription;
        this.durationKey = DurationKey;
        this.pubDate = pubDate;
        this.playbackPosition = ( playbackPosition ? playbackPosition : 0 );
    }
}

// This function removes advertising
/*
function getEpisodeInfoFromDescription(episodeDescription) {
    //NOTE: It works better but slow
    /*
    let htmlDoc = new JSDOM(episodeDescription, {contentType: "text/html"}).window.document;
    let $p = htmlDoc.getElementsByTagName("p");
    if($p.length != 0) {
        $p[0].innerHTML = $p[0].innerText || $p[0].textContent;
        episodeDescription = $p[0].innerHTML;
    }
    *//*

    let backup = episodeDescription;

    let episodeInfo = episodeDescription.replace(/(<([^>]+)>)/ig, "<tag>").split("<tag>");
    episodeInfo = ( episodeDescription[0] != '<' ? episodeInfo[0] : episodeInfo[1] );
    episodeInfo = episodeInfo.replace(/<[^>]*(>|$)|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/g, '');

    if(episodeInfo.trim() == '')
        episodeInfo = backup;

    return episodeInfo;
}
*/

function xmlParser(xml, feedUrl) {
    let xmlDoc = new JSDOM(xml, {contentType: "text/xml"}).window.document;
    let json = [];
    let channelName = xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("title")[0].childNodes[0].nodeValue;
    let items = xmlDoc.getElementsByTagName("item");
    for(let i = 0; i < items.length; i++) {
        let item = items[i];
        let enclosure = item.getElementsByTagName('enclosure')[0];

        let description = '';
        let subtitle = item.getElementsByTagName('itunes:subtitle')[0];
        if(subtitle)
            description = subtitle.textContent;

        subtitle = item.getElementsByTagName('description')[0];
        if(subtitle && subtitle.textContent.length > description.length)
            description = subtitle.textContent;
        
        subtitle = item.getElementsByTagName('itunes:summary')[0];
        if(subtitle && subtitle.textContent.length > description.length)
            description = subtitle.textContent;

        let duration = item.getElementsByTagName('itunes:duration')[0];
        if(duration)
            duration = duration.innerHTML;
        else {
            duration = item.getElementsByTagName('duration')[0];
            if(duration)
                duration = duration.innerHTML;
            else
                duration = '';
        }

        let episode = new Episode (
            channelName,
            feedUrl,
            item.getElementsByTagName("title")[0].childNodes[0].nodeValue,
            (enclosure ? enclosure.getAttribute('url') : ''),
            (enclosure ? enclosure.getAttribute('type') : ''),
            (enclosure ? enclosure.getAttribute('length') : ''),
            description, //getEpisodeInfoFromDescription(description),
            duration,
            item.getElementsByTagName('pubDate')[0].innerHTML
        );
        json.push(episode);
    }
    
    // console.log(json)
    postMessage({json: json, feedUrl: feedUrl});
}

onmessage = function (ev) { 
    try {
        xmlParser(ev.data.xml, ev.data.feedUrl);
    } catch(err) {
        console.log(err)
    }
};
