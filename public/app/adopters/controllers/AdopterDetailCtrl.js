angular.module('app').
	controller('AdopterDetailCtrl', function($scope, $routeParams, $location, Adopter, cachedAdopters, mvNotifier, common, mvIdentity) {
    $scope.permission = {
      delete: mvIdentity.isAuthorized('manager'),
      readonly: mvIdentity.isAuthorized('observer')
    };
    $scope.validation = {
      zip: /^\d{5}(-\d{4})?$/,
      phone: /^(?:\([2-9]\d{2}\)\ ?|[2-9]\d{2}(?:\-?|\ ?))[2-9]\d{2}[- ]?\d{4}$/
    };

    $scope.busy = function() {
      return $scope.adopter && $scope.adopter.$promise && !$scope.adopter.$resolved;
    };

    $scope.create = function() {
      $scope.submitted = false;
      $scope.adopter = new Adopter({
        entity: 'Individual',
        address: {
          city: 'Topeka',
          state: 'KS'
        },
        phones: [{ name: 'Home' }],
        adoptees: [],
        enums: cachedAdopters.enums(),
        notifyMethods: [],
        criteria: {
          childAges: [],
          households: [],
          special: []
        }
      });

      $scope.master = angular.copy($scope.adopter);
    };

    $scope.get = function() {
      $scope.submitted = false;
      $scope.adopter = Adopter.get({ id: $routeParams.id });
      $scope.adopter.$promise.
        then(function(data) {
          $scope.master = angular.copy(data);
        });
    };

    $scope.save = function(form, plus) {
      $scope.submitted = true;

      if(form.$invalid) {
        mvNotifier.notifyError("Some validation errors prevented us from saving this adopter.");
      } else {
        Adopter.save($scope.adopter, function() {
          mvNotifier.notify($scope.adopter.name + ' successfully saved!');

          if(plus) {
            $location.path('/adopters/0');
            $scope.create();
            form.$setPristine();
          } else {
            $location.path('/adopters');
          }
        });
      }
    };

    $scope.cancel = function() {
      $scope.adopter = angular.copy($scope.master);
      $location.path('/adopters');
    };

    $scope.deletePhone = function(phone, index) {
      var array = $scope.adopter.phones;

      array.splice(index, 1);
    };

    $scope.addPhone = function() {
      var array = $scope.adopter.phones;

      if(!angular.isArray(array)) {
        array = ($scope.adopter.phones = []);
      }

      array.push({ name: $scope.adopter.enums.phone[0] });
    };

    $scope.setFlags = common.setFlags;

    ($routeParams.id === '0' ? $scope.create : $scope.get)();
	});