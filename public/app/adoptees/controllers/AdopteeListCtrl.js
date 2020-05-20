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
  controller('adopteeListCtrl', function($scope, $filter, $location, Adoptee, cachedAdoptees, mvIdentity, mvNotifier) {
    var adoptees;

    $scope.query = $location.search().q;

    $scope.permission = {
      delete: mvIdentity.isAuthorized('manager'),
      readonly: mvIdentity.isAuthorized('observer')
    };

    $scope.sort = {
      value: '-createDate',
      text: 'Create Date: Recent to Old',
      options: [
        {value: ['lastName', 'firstName'], text: 'Name'},
        {value: 'createDate', text: 'Create Date: Old to Recent'},
        {value: '-createDate', text: 'Create Date: Recent to Old'}
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
      return !adoptees.$resolved;
    };

    $scope.applySort = function(sortOption) {
      angular.extend($scope.sort, sortOption);
    };

    $scope.applyFilter = function(query) {
      adoptees.$promise.then(function() {
        $scope.adoptees = $filter('filter')(adoptees.data, query);
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
      $scope.page.total = Math.ceil($scope.adoptees.length / $scope.page.size);
      $scope.page.previous = page > 1 ? page - 1 : page;
      $scope.page.next = page < $scope.page.total ? page + 1 : page;
    };

    $scope.select = function(adoptee) {
      $location.path('/adoptees/' + adoptee._id);
    };

    $scope.delete = function(adoptee) {
        Adoptee.delete({ _id: adoptee._id }, function (res) {
            if (res.error) {
                mvNotifier.notifyError(res.error);
            } else {
                mvNotifier.notify(adoptee.firstName + ' ' + adoptee.lastName + ' was deleted.');
                var index = $scope.adoptees.indexOf(adoptee);

                if (index !== -1) {
                    $scope.adoptees.splice(index, 1);
                }

                $location.path('/adoptees');
            }
        });
    };

    $scope.refresh = function(clearCache) {
      if(clearCache) {
        cachedAdoptees.clear();
      }

      adoptees = cachedAdoptees.query();
      $scope.applyFilter($scope.query);
    };

    $scope.refresh();
  });