angular.module('app').factory('Adoptee', function($resource, $q) {
  var AdopteeResource = $resource('/api/adoptees/:_id', {_id: "@id"}, {
      updateAdoptee: {
          method:'PUT',
          isArray:false
      },
      matchAdoptee: {
          method:'PUT',
          url: 'api/adoptees/match',
          isArray:false
      },
      query : {
          method : 'GET',
          isArray : false
      },
      enums : {
          method : 'GET',
          url : '/api/adoptees/:_id/enums',
          isArray : false
      },

      getAdopteeByNumber : {
          method : 'GET',
          isArray : false
      },

      getNextAdoptee : {
          method : 'POST',
          isArray : false
      }
  });

  return AdopteeResource;
});

angular.module('app').factory('AdopteeDuplicates', function($resource) {
  var AdopteeDupsResource = $resource('/api/adoptees/duplicates', {}, {
    get : {
      method : 'GET',
      isArray : true
    }
  });

  return AdopteeDupsResource;
});