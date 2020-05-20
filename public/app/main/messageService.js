angular.module('app').factory('MessageService', function($resource) {
	var MessageResource = $resource('/api/messages/:type', {}, {
		get : {
			method : 'GET',
			isArray : false
		},
		update : {
			method : 'PUT',			
			isArray : false
		}
	});

	return MessageResource;
});