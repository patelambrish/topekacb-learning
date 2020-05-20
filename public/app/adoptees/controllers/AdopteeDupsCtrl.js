angular.module('app').
  filter('startFrom', function() {
    return function(array, start) {
      start = parseInt(start, 10);
      
      return (angular.isArray(array) || angular.isString(array)) && start ? array.slice(start) : array;
    };
  }).
  filter('fullName', function() {
    return function(data, format) {
      if(!data) {
        return;
      }
      
      var fName = data.firstName || '',
          lName = data.lastName || '';
          
      format = format || 'ltr';

      if(format === 'ltr') {
        return fName && lName ? lName + ', ' + fName : lName + fName;
      } else {
        return fName && lName ? fName + ' ' + lName : lName + fName;
      }
    };
  }).
  controller('AdopteeDupsCtrl', function($scope, $filter, $location, AdopteeDuplicates, mvIdentity, mvNotifier) {
    var adopteeDups;
    
    $scope.permission = {
      delete: mvIdentity.isAuthorized('manager')
    };

    $scope.sort = {
      value: 'firstName',
      text: 'First Name',
      options: [
        {value: 'firstName', text: 'First Name'},
        {value: 'lastName', text: 'Last Name'},
        {value: 'ssnLastFour', text: 'SSN Last Four'},
        {value: 'address.homeAddress', text: 'Street Address'}
      ]
    };
    
    $scope.page = {
      current: 1,
      total: 1,
      previous: 1,
      next: 1,
      size: 10
    };
    
    $scope.busy = function() {
      return !adopteeDups.$resolved;
    };

    $scope.applySort = function(sortOption) {
      angular.extend($scope.sort, sortOption);
    };
    
    $scope.applyFilter = function(query) {
      adopteeDups.$promise.then(function() {
        $scope.adoptees = $filter('filter')(adopteeDups, query);
        $scope.applyPage(1);
      });
    };
    
    $scope.applyPage = function(page) {
      $scope.page.current = page;
      $scope.page.total = Math.ceil($scope.adoptees.length / $scope.page.size);
      $scope.page.previous = page > 1 ? page - 1 : page;
      $scope.page.next = page < $scope.page.total ? page + 1 : page;
    };
    
    $scope.select = function(adoptee) {
      $location.path('/adoptees/' + adoptee._id);
    };
    
    adopteeDups = AdopteeDuplicates.get();
    $scope.applyFilter();

    //$scope.refresh();
  });