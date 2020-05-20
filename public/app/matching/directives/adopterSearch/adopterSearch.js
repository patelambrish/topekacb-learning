angular.module('app').directive('adopterSearch', ['Adopter', '$filter','cachedAdopters',
function(Adopter, $filter,cachedAdopters) {
	return {
		templateUrl : '/partials/matching/directives/adopterSearch/adopterSearch',
		restrict : 'A',
		replace: true,
		controller : ['$scope',
		function($scope) {
			//default page size
			$scope.adopterPage = {
				current : 1,
				total : 1,
				previous : 1,
				next : 1,
				size : 3
			};
			$scope.adopterFilter = {
			  status: 'Not Matched'
			};
			cachedAdopters.enums({
				_id : 0
			}).$promise.then(function(data) {
				$scope.adopterEnums = data;
			});

			$scope.searchAdopters = function() {
				Adopter.query({
					filter : $scope.adopterFilter,
					sort : $scope.adopterSort.value,
					start : ($scope.adopterPage.current * $scope.adopterPage.size) - $scope.adopterPage.size,
					limit : $scope.adopterPage.size
				}).$promise.then(function(res) {
					$scope.adopterSearchResults = res;
					//console.log($scope.adopterSearchResults);
					$scope.applyPage($scope.adopterPage.current, $scope.adopterSearchResults, $scope.adopterPage);
				});

			};
			$scope.adopterSort = {
				value : 'org name',
				text : 'Name',
				options : [{
					value : 'org name',
					text : 'Name'
				}, {
					value : '-criteria.count',
					text : 'Households: High to Low'
				}, {
					value : 'criteria.count',
					text : 'Households: Low to High'
				}]
			};
			$scope.applyAdopterSort = function(sortOption) {
				angular.extend($scope.adopterSort, sortOption);
				$scope.getAdopterPage(1);
			};
			$scope.applyAdopterFilter = function(filter) {
        angular.extend($scope.adopterFilter, filter);
        $scope.getAdopterPage(1);
			};
			$scope.getAdopterPage(1);
		}]

	};
}]);

angular.module('app').directive('adopterMatchResults', ['Adopter','$filter',
function(Adopter, $filter) {
	return {
		templateUrl : '/partials/matching/directives/adopterSearch/adopterSearchResults',
		restrict: 'A',
		replace: true
	};
}]);