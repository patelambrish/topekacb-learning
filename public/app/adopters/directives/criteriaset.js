angular.module('app').
  directive('criteriaset', function(common, mvIdentity) {
    return {
      scope: {
        adopter: '=',
        fields: '=',
        change: '&'
      },
      replace: true,
      templateUrl: '/partials/adopters/criteriaset',
      link: function(scope, element, attrs) {
        scope.title = attrs.title;
      },
      controller: function($scope, $location, mvNotifier) {
        $scope.page = {
          current: 1,
          total: 1,
          previous: 1,
          next: 1,
          size: 3
        };

        $scope.permission = {
          delete: mvIdentity.isAuthorized('manager'),
          readonly: mvIdentity.isAuthorized('observer')
        };

        $scope.sort = {
          value: 'lastName'
        };

        $scope.applyPage = function(page) {
          if($scope.adopter.adoptees) {
            $scope.page.current = page;
            $scope.page.total = Math.ceil($scope.adopter.adoptees.length / $scope.page.size);
            $scope.page.previous = page > 1 ? page - 1 : page;
            $scope.page.next = page < $scope.page.total ? page + 1 : page;
          }
        };

        $scope.select = function(adoptee) {
          $location.path('/adoptees/' + adoptee._id);
        };

        $scope.remove = function(adoptee) {
          var adopter = $scope.adopter,
              array = adopter.adoptees,
              index = angular.isArray(array) ? array.indexOf(adoptee) : -1;

          if(index !== -1) {
            array.splice(index, 1);
            $scope.applyPage(1);
          }

          adopter.$removeAdoptee({id: adopter._id, adopteeId: adoptee._id}, function() {
            mvNotifier.notify(adoptee.firstName + ' ' + adoptee.lastName + ' removed from ' + adopter.name);
          });
        };

        $scope.setFlags = function(flags) {
          var oldValue = angular.copy(flags);
              
          common.setFlags.apply(this, arguments);
          ($scope.change || angular.noop)({
            newValue: flags,
            oldValue: oldValue
          });
        };

        $scope.$watch('adopter.adoptees', function(newValue) {
          if(newValue) {
            $scope.applyPage(1);
          }
        });
      }
    };
  });
