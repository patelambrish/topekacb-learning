angular.module('app').factory('Adopter', function($http, $resource) {
	var AdopterResource = $resource('/api/adopters/:id', null, {
		query: {
			method: 'GET',
			isArray: false
		},
		enums: {
			method: 'GET',
			url: '/api/adopters/:id/enums',
			isArray: false
		},
		removeAdoptee: {
		  method: 'DELETE',
      url: '/api/adopters/:id/adoptees/:adopteeId',
		  isArray: false
		},
		save: {
			method: 'POST',
			transformRequest: [mapIds].concat($http.defaults.transformRequest)
		}
	});

	function mapIds(data) {
		if(Array.isArray(data.adoptees) && data.adoptees.length) {
		  data.adoptees = data.adoptees.map(function(item) {
		    return item._id || item;
		  });
		}

		return data;
	}

	return AdopterResource;
});