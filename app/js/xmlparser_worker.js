importScripts('./lib/jsdom.js')
importScripts('./podcast_class.js')
importScripts('./episode_class.js')

function xmlParser(xml, feedUrl, artwork) {
    let xmlDoc = new JSDOM(xml, {contentType: "text/xml"}).window.document;

    let channel = xmlDoc.getElementsByTagName("channel")[0];
    let channelName = channel.getElementsByTagName("title")[0].childNodes[0].nodeValue;
    
    let artworkUrl = channel.getElementsByTagName("itunes:image")[0];
    if(artworkUrl)
    	artworkUrl = artworkUrl.getAttribute('href');
    else {
		artworkUrl = channel.getElementsByTagName("image")[0];
		if(artworkUrl) {
			artworkUrl = artworkUrl.getElementsByTagName("url")[0]
			if(artworkUrl)
				artworkUrl = artworkUrl.textContent;
		}
    }

    let artistName = channel.getElementsByTagName("itunes:author")[0];
    if(artistName)
        artistName = artistName.textContent;
    else {
        let artistName = channel.getElementsByTagName("author")[0];
        if(artistName)
            artistName = artistName.childNodes[0].nodeValue;
        else 
            artistName = '';
    }

    let podcastDescription = '';
    let podcastSubtitle = channel.getElementsByTagName('itunes:subtitle')[0];
    if(podcastSubtitle)
        podcastDescription = podcastSubtitle.textContent;
    podcastSubtitle = channel.getElementsByTagName('description')[0];
    if(podcastSubtitle && podcastSubtitle.textContent.length > podcastDescription.length)
        podcastDescription = podcastSubtitle.textContent;
    
    podcastSubtitle = channel.getElementsByTagName('itunes:summary')[0];
    if(podcastSubtitle && podcastSubtitle.textContent.length > podcastDescription.length)
        podcastDescription = podcastSubtitle.textContent;

    let podcastData = new Podcast(
        artistName,
        channelName,
        artworkUrl,
        feedUrl,
        podcastDescription
    );

    let json = [];
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
            (enclosure ? enclosure.getAttribute('url').split("?")[0] : ''),
            (enclosure ? enclosure.getAttribute('type') : ''),
            (enclosure ? enclosure.getAttribute('length') : ''),
            description, 
            duration,
            item.getElementsByTagName('pubDate')[0].innerHTML,
            artwork
        );
        json.push(episode);
    }
    
    postMessage({json: json, podcastData: podcastData});
}

onmessage = function (ev) { 
    try {
        xmlParser(ev.data.xml, ev.data.feedUrl, ev.data.artwork);
    } catch(err) {
        console.log(err)
    }
};
