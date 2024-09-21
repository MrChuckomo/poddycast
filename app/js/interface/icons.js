'use strict';

module.exports = {
    deleteIcon: '<i onclick="event.stopPropagation(); window.episodeAPI.delete(this)" class="bi bi-trash3" style="font-size: 1.3rem"></i>',
    addEpisodeIcon: '<i class="bi bi-plus-square" onclick="event.stopPropagation(); window.episodeAPI.add(this)" style="font-size: 1.3rem;"></i>',
    infoIcon: '<i class="bi bi-info-circle" style="font-size: 1.3rem;"></i>',
    brokenLinkIcon: '<i class="bi bi-wifi-off"></i>',

    favorite:
`
<svg class="set-favorite" onclick="window.navAPI.unsubscribePodcast(this)" fill="#000000" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
</svg>
`,

    checkBox: '<i class="bi bi-check-square-fill text-blue"></i>',
    checkBoxOutline: '<i class="bi bi-square"></i>'
};
