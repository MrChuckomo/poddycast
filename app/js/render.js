'use strict';

// NOTE: Tests only so far


// document.getElementById('click_button').addEventListener('click', async () => {
//     let dark = await window.myAPI.toggle();
//     console.log(dark);
// });


window.myAPI.doAThing();
onBodyLoad();


function onBodyLoad() {
    console.log('on body load');

    // global.init();
    // playlist.loadPlaylists();
    // window.msgAPI.readFeeds();
    // feed.readFeeds();
    // menujs.showNewEpisodes();
    // navigation.setItemCounts();
    // translations.translate();
    // audioPlayer.init();
}