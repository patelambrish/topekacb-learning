angular.module('app').
  factory('cachedAdoptees', function(Adoptee) {
    var adopteeList,
        enums;
    
    return {
      query: function() {
        if(!adopteeList) {
          adopteeList = Adoptee.query();
        }

        return adopteeList;
      },
      enums: function() {
        if(!enums) {
          enums = Adoptee.enums({_id: 0});
        }
        
        return enums;
      },
      clear: function() {
        adopteeList = null;
      }
    };
  });