'use strict';


document.getElementById('search-input').addEventListener('keyup', (event) => {
    const value = document.getElementById('search-input').value;
    const key = event.code;
    window.navAPI.searchInput(value, key);
});
document.getElementById('menu-episodes').addEventListener('click', () => {
    window.navAPI.clickEpisodes();
});
document.getElementById('menu-favorites').addEventListener('click', () => {
    window.navAPI.clickFavorites();
});
document.getElementById('menu-history').addEventListener('click', () => {
    window.navAPI.clickHistory();
});
document.getElementById('menu-statistics').addEventListener('click', () => {
    window.navAPI.clickStatistics();
});
document.getElementById('menu-refresh').addEventListener('click', () => {
    window.navAPI.clickRefresh();
});


// NOTE: Bundle listern for all list items on the right content side
document.getElementById('list').addEventListener('click', function (event) {
    const pageHeader = document.getElementById('content-right-header').getElementsByTagName('h1')[0];

    if (pageHeader.innerText === 'Favorites'){
        openPodcastEpisodes(event.target);
    }
});

function openPodcastEpisodes(element) {
    switch (element.tagName) {
    case 'IMG': window.navAPI.clickPodcast(element.parentElement); break;
    case 'DIV': window.navAPI.clickPodcast(element.parentElement); break;
    default: break;
    }
}

// NOTE: Tests only so far
// document.getElementById('click_button').addEventListener('click', async () => {
//     let dark = await window.myAPI.toggle();
//     console.log(dark);
// });

async function geti18n() {
    let lang = await window.myAPI.sysLanguage('New Episodes');
    console.log(lang);
}

geti18n();
