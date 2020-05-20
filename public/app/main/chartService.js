angular.module('app').factory('ChartService', function($resource) {
	var ChartResource = $resource('/api/chartdata', {}, {
		get : {
			method : 'GET',
			isArray : true
		}
	});

	return ChartResource;
});

angular.module('app').factory('BarChartService', function($resource) {
	var BarChartResource = $resource('/api/chartdata/bar', {}, {
		get : {
			method : 'GET',
			isArray : true
		}
	});

	return BarChartResource;
});

angular.module('app').factory('AgeChartService', function($resource) {
	var BarChartResource = $resource('/api/stats/age', {}, {
		get : {
			method : 'GET',
			isArray : true
		}
	});

	return BarChartResource;
});