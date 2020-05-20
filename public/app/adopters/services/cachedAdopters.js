angular.module('app').
  factory('cachedAdopters', function(Adopter) {
    var adopterList,
        enums;
    
    return {
      query: function() {
        if(!adopterList) {
          adopterList = Adopter.query();
        }

        return adopterList;
      },
      enums: function() {
        if(!enums) {
          enums = Adopter.enums({id: 0});
        }
        
        return enums;
      },
      clear: function() {
        adopterList = null;
      }
    };
  });