window.localization = window.localization || {},
function(n) {
    localization.translate = {

      menu: function() {
        $('#welcome-menu').text(i18n.__('Welcome'));
        $('#whoweare-menu').text(i18n.__('Who we are'));
        $('#whatwedo-menu').text(i18n.__('What we do'));
        $('#getintouch-menu').text(i18n.__('Get in touch'));

      },

      welcome: function() {
        $('.new-episodes').text(i18n.__('New Episodes'));
        $('.favorites').text(i18n.__('Favorites'));
        $('.history').text(i18n.__('History'));
        $('.statistics').text(i18n.__('Statistics'));
        $('#search-input').attr('placeholder',i18n.__('Search'));
      },

      init: function() {
        this.welcome();
        this.menu();
      }
    };

    n(function() {
        localization.translate.init();
    })

}(jQuery);
