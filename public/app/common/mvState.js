angular.module('app').factory('mvState', function($resource) {
    var StateResource = $resource('/api/states', {}, {
        query: {method: 'GET', cache: true, isArray: true}
    });

    return StateResource;
});