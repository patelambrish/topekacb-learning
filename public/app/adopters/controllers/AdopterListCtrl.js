angular.module('app').
  controller('AdopterListCtrl', function($scope, $filter, $location, Adopter, cachedAdopters, mvIdentity, mvNotifier) {
    var adopters;

    $scope.query = $location.search().q;

    $scope.permission = {
      delete: mvIdentity.isAuthorized('manager'),
      readonly: mvIdentity.isAuthorized('observer')
    };

    $scope.sort = {
      value: '-createDate',
      text: 'Enroll Date: Recent to Old',
      options: [
        {value: 'name', text: 'Name'},
        {value: 'createDate', text: 'Enroll Date: Old to Recent'},
        {value: '-createDate', text: 'Enroll Date: Recent to Old'}
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
      return !adopters.$resolved;
    };

    $scope.applySort = function(sortOption) {
      angular.extend($scope.sort, sortOption);
    };

    $scope.applyFilter = function(query) {
      adopters.$promise.then(function() {
        $scope.adopters = $filter('filter')(adopters.data, query);
        $scope.applyPage(1);
      });

      if (query) {
        $location.search('q', query);
      } else {
        $location.search('q', null);
      }
    };

    $scope.applyPage = function(page) {
      $scope.page.current = page;
      $scope.page.total = Math.ceil($scope.adopters.length / $scope.page.size);
      $scope.page.previous = page > 1 ? page - 1 : page;
      $scope.page.next = page < $scope.page.total ? page + 1 : page;
    };

    $scope.select = function(adopter) {
      $location.path('/adopters/' + adopter._id);
    };

    $scope.delete = function(adopter) {
      Adopter.remove({ id: adopter._id }, function() {
        var array = $scope.adopters,
            index = angular.isArray(array) ? array.indexOf(adopter) : -1;

        if(index !== -1) {
          array.splice(index, 1);
        }

        mvNotifier.notify(adopter.name + ' was deleted.');
      });
    };

    $scope.refresh = function(clearCache) {
      if(clearCache) {
        cachedAdopters.clear();
      }

      adopters = cachedAdopters.query();
      $scope.applyFilter($scope.query);
    };

    $scope.refresh();
  });