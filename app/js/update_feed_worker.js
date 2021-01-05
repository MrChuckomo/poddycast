function getDifferenceFeed(oldFeed, newFeed) {
    let feedUrl = oldFeed.length == 0 ? newFeed[0].feedUrl : oldFeed[0].feedUrl;
    let feed = newFeed;
    
    oldFeed = oldFeed.map(x => x.episodeUrl);
    newFeed = newFeed.map(x => x.episodeUrl);

    let new_episodes = newFeed.filter(x => oldFeed.indexOf(x) === -1);
    let deleted_episodes = oldFeed.filter(x => !newFeed.includes(x));

    if(new_episodes.length == 0 && deleted_episodes.length == 0)
        return;
        
    postMessage({
        feedUrl: feedUrl, 
        new_episodes: new_episodes, 
        deleted_episodes: deleted_episodes, 
        initialLength: oldFeed.length,
        feed: feed
    });

    /*
    let updated_episodes = [].concat(...deleted_episodes.map(d => new_episodes.map(e => Object.assign({oldEpisodeUrl: d, newEpisodeUrl: e}))))
                             .filter(x => x.newEpisodeUrl.split("?")[0] == x.oldEpisodeUrl.split("?")[0]);
    */
}

onmessage = function (ev) { 
    try {
        getDifferenceFeed(ev.data.oldFeed, ev.data.newFeed);
    } catch(err) {
        console.log(err)
    }
};
