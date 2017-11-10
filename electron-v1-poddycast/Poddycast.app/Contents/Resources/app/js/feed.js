
function readFeeds()
{
    // TODO: read all Feeds
    // TODO: distinguish between http and https
    // TODO: compare existing episodes with new
    // TODO: if new episodes add to the json file
    // TODO: json file can be used to diplay "New Episodes" menu item
    // TODO: find actual mp3 file
    // TODO: save a file for each podcast including all episodes

    if (fs.readFileSync(getSaveFilePath(), "utf-8") != "")
    {
        JsonContent = JSON.parse(fs.readFileSync(getSaveFilePath(), "utf-8"))

        // console.log(fs.readFile("http://teenagersexbeichte.de/feed/tsbfeed/", "utf-8"));


        for (var i = 0; i < JsonContent.length; i++)
        {
            // var req = http.request("http://teenagersexbeichte.de/feed/tsbfeed/", function(res)

            if (JsonContent[i].feedUrl.includes("https"))
            {
                var req = https.request(JsonContent[i].feedUrl, function(res)
                {
                    var Content = ""

                    res.setEncoding('utf8');

                    res.on('data', function (chunk)
                    {
                        Content += chunk
                    });

                    res.on("end", function()
                    {
                        parser = new DOMParser();
                        xmlDoc = parser.parseFromString(Content,"text/xml");

                        var ChannelName   = xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("title")[0].childNodes[0].nodeValue
                        var EpisodeTitle  = xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("title")[0].childNodes[0].nodeValue
                        var EpisodeLength = xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("enclosure")[0].getAttribute("length")
                        var EpisodeType   = xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("enclosure")[0].getAttribute("type")
                        var EpisodeUrl    = xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("enclosure")[0].getAttribute("url")

                        saveEpisode(ChannelName, EpisodeTitle, EpisodeUrl, EpisodeType, EpisodeLength)
                    })
                });
            }
            else
            {
                var req = http.request(JsonContent[i].feedUrl, function(res)
                {
                    var Content = ""

                    res.setEncoding('utf8');

                    res.on('data', function (chunk)
                    {
                        Content += chunk
                    });

                    res.on("end", function()
                    {
                        parser = new DOMParser();
                        xmlDoc = parser.parseFromString(Content,"text/xml");
                        // console.log(xmlDoc);
                        // console.log(xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("title")[0].childNodes[0].nodeValue);
                        // console.log(xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("title")[0].childNodes[0].nodeValue);
                        // console.log(xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("enclosure")[0].getAttribute("length"));
                        // console.log(xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("enclosure")[0].getAttribute("type"));
                        // console.log(xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("enclosure")[0].getAttribute("url"));

                        var ChannelName   = xmlDoc.getElementsByTagName("channel")[0].getElementsByTagName("title")[0].childNodes[0].nodeValue
                        var EpisodeTitle  = xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("title")[0].childNodes[0].nodeValue
                        var EpisodeLength = xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("enclosure")[0].getAttribute("length")
                        var EpisodeType   = xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("enclosure")[0].getAttribute("type")
                        var EpisodeUrl    = xmlDoc.getElementsByTagName("item")[0].getElementsByTagName("enclosure")[0].getAttribute("url")

                        saveEpisode(ChannelName, EpisodeTitle, EpisodeUrl, EpisodeType, EpisodeLength)
                    })
                });
            }

            req.on('error', function(e)
            {
                console.log('problem with request: ' + e.message);
            });

            req.end();
        }
    }
}

function saveEpisode(_ChannelName, _EpisodeTitle, _EpisodeUrl, _EpisodeType, _EpisodeLength)
{
    if (getValueFromFile(getArchivedFilePath, "episodeUrl", "episodeUrl", _EpisodeUrl) == null)
    {
        var Feed =
        {
            "channelName": _ChannelName,
            "episodeTitle": _EpisodeTitle,
            "episodeUrl": _EpisodeUrl,
            "episodeType": _EpisodeType,
            "episodeLength": _EpisodeLength,
            "playbackPosition": 0,
        }

        var JsonContent = []

        if (fs.existsSync(getNewEpisodesSaveFilePath()) && fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8") != "")
        {
            JsonContent = JSON.parse(fs.readFileSync(getNewEpisodesSaveFilePath(), "utf-8"))
        }
        else
        {
            fs.writeFileSync(getNewEpisodesSaveFilePath(), JSON.stringify(JsonContent))
        }

        if (!isEpisodeAlreadySaved(_EpisodeTitle))
        {
            JsonContent.push(Feed)
        }

        fs.writeFileSync(getNewEpisodesSaveFilePath(), JSON.stringify(JsonContent))
    }
}
