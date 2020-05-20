angular.module('app').controller('PrintEmailController', ['$scope', '$filter', 'mvNotifier', 'Adopter', 'Adoptee', 'AdopterEmailService', 'AdopterPrintService', 'AdopterPrintEmailService','$window',
function($scope, $filter, mvNotifier, Adopter, Adoptee, AdopterEmailService, AdopterPrintService, AdopterEmailPrintService,$window) {

	var reqList = AdopterEmailPrintService.query();

	$scope.sort = {
		value : '-createDate',
		text : 'Create Date: Recent to Old',
		options : [{
			value : 'name',
			text : 'Name'
		}, {
			value : 'createDate',
			text : 'Create Date: Old to Recent'
		}, {
			value : '-createDate',
			text : 'Create Date: Recent to Old'
		}, {
			value : 'updateDate',
			text : 'Update Date: Old to Recent'
		}, {
			value : '-updateDate',
			text : 'Update Date: Recent to Old'
		}]
	};

	$scope.page = {
		current : 1,
		total : 1,
		previous : 1,
		next : 1,
		size : 10
	};

	$scope.busy = function() {
		return !reqList.$resolved;
	};

	$scope.applySort = function(sortOption) {
		angular.extend($scope.sort, sortOption);
	};

	$scope.applyFilter = function(query) {
		reqList.$promise.then(function() {
			$scope.reqList = $filter('filter')(reqList, query);
			$scope.applyPage(1);
		});
	};

	$scope.applyPage = function(page) {
		$scope.page.current = page;
		$scope.page.total = Math.ceil($scope.reqList.length / $scope.page.size);
		$scope.page.previous = page > 1 ? page - 1 : page;
		$scope.page.next = page < $scope.page.total ? page + 1 : page;
	};

	$scope.applyFilter();

}]);