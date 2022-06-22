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


// NOTE: Tests only so far
// document.getElementById('click_button').addEventListener('click', async () => {
//     let dark = await window.myAPI.toggle();
//     console.log(dark);
// });
