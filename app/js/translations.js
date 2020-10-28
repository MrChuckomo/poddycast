
function translate() {
  translateByDescriptor(".new-episodes", 'New Episodes');
  translateByDescriptor(".favorites", 'Favorites');
  translateByDescriptor(".history", 'History');
  translateByDescriptor(".playlists", 'Playlists');
  translateByDescriptor(".refresh", 'Refresh');
  translateByDescriptor(".statistics", 'Statistics');

  translateByDescriptor('#content-right-player-title', 'No episode selected');
  
  document.getElementsByName('search')[0].placeholder=i18n.__('Search');
  document.getElementsByName('new_list')[0].placeholder=i18n.__('New List');
}

function translateByDescriptor(descriptor, value){
  $(descriptor).html(i18n.__(value));
}
