angular.module('app').factory('AdopterEmailService', function($resource, $q) {
  var EmailResource = $resource('/api/email/:id', {}, {
      get: {
          method:'GET',
          isArray:false
      }
  });

  return EmailResource;
});

angular.module('app').factory('AdopterPrintService', function($resource, $q) {
  var PrintResource = $resource('/api/print/:_id', {_id: "@id"}, {
      get: {
          method:'GET',
          isArray:false
      }
  });

  return PrintResource;
});

angular.module('app').factory('AdopterPrintEmailService', function($resource, $q) {
  var PrintEmailResource = $resource('/api/printemails/:_id', {_id: "@id"}, {
  	  query: {
  	  	method: 'GET',
  	  	isArray: true
  	  },
      get: {
          method:'GET',
          isArray:false
      },
      create: {
      	method: 'POST',
      	isArray: false
      }
  });

  return PrintEmailResource;
});