angular.module('app').factory('AdopteeApplicationCounter', function($resource, $q) {
  var AdopteeApplicationCounterResource = $resource('/api/adopteeapplicationcounter', {}, {
    getNextSequence: {method:'Get', isArray:false}
  });
  return AdopteeApplicationCounterResource;
});