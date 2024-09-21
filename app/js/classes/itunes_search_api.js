'use strict';

const Categoires = {
    ART: 'art',
    COMEDY: 'comedy',
    LEISURE: 'leisure',
    MUSIC: 'music',
    NEWS: 'news',
    SCIENCE: 'science',
    SPORTS: 'sports',
    TECHNOLOGY: 'technology',
    TRUECRIME: 'true crime',
    MOVIES: 'movies'
};
module.exports.Categoires = Categoires;

class ITunesSearchApi {
    constructor(media='podcast') {
        this.baseUrl = 'https://itunes.apple.com/';
        this.media = media;
    }

    /**
     * Search for a specific Podcast
     * @param {String} searchTerm
     */
    podcast(searchTerm) {
        return `${this.baseUrl}search?media=podcast&term=${searchTerm}`;
    }

    /**
     * Search for a Top 10 (e.g. category).
     * @param {String} searchTerm
     */
    top10(searchTerm) {
        let country = mapLangCountry(document.documentElement.lang);
        return `${this.baseUrl}search?media=podcast&limit=20&country=${country}&term=${searchTerm}`;
    }
}
module.exports.ITunesSearchApi = ITunesSearchApi;


/**
 * https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
 * Map the locale- to the country-code.
 * @param {String} lang
 */
function mapLangCountry(lang) {
    switch (lang) {
        case 'de': return 'de';
        case 'en': return 'us';
        case 'es': return 'es';
        case 'fr': return 'fr';
        case 'it': return 'it';
        case 'ja': return 'jp';
        case 'nl': return 'nl';
        case 'pt': return 'pt';
        case 'pt-BR': return 'pt';
        case 'pt-PT': return 'pt';
        case 'ru': return 'ru';
        default: return 'us';
    }
}
