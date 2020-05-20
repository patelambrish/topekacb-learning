angular.module('app').
  value('cbSites', {
   /*  'L': 'Let\'s Help',
    'D': 'Deer Creek',
    'A': 'Antioch',
    'O': 'Other' */
    'Echo Ridge': 'Echo Ridge',
    'Pine Ridge': 'Pine Ridge',
    'State Street': 'State Street',
    'Jackson Towers': 'Jackson Towers',
    'Polk Towers': 'Polk Towers',
    'Tenn Town I': 'Tenn Town I',
    'Tenn Town II': 'Tenn Town II',
    'Tyler Towers': 'Tyler Towers',
    'TRM': 'TRM',
    'Other': 'Other'
  }).
  factory('cbCurrentSite', function(cbSites) {
    var currentSite;

    return {
      name: function() {
        return cbSites[currentSite];
      },
      get: function() {
        return currentSite;
      },
      set: function(site) {
        currentSite = site;
      },
      exists: function() {
        return !!currentSite;
      },
      clear: function() {
        currentSite = null;
      }
    };
});