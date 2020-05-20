angular.module('app').
  controller('adopteeDetailCtrl', function($scope, $routeParams, $location, $filter, cbSites, cbCurrentSite, Adoptee, AdopteeApplicationCounter, mvNotifier, common, mvIdentity) {
    $scope.sites = cbSites;
    $scope.enums = Adoptee.enums({ _id: $routeParams.id });
    $scope.adopteeTitle = '';
    $scope.permission = {
      delete: mvIdentity.isAuthorized('manager'),
      readonly: mvIdentity.isAuthorized('observer') || mvIdentity.isAuthorized('adopter'),
      readonlyAdopter: mvIdentity.isAuthorized('adopter')
    };
    $scope.setNewAdoptee = function(currentNumber){
        $scope.adoptee = new Adoptee({
            site: cbCurrentSite.get(),
            householdMembers: [],
            criteria: {
              specialNeeds: []
            },
            address: {
              city: 'Topeka',
              state: 'KS'
            },
            status: 'In Process'
        });
        $scope.adopteeTitle = 'New Adoptee';
    };

    $scope.siteUndefined = function() {
      return $scope.adoptee && !$scope.adoptee.site;
    };

    $scope.onsitechange = function(site) {
      $scope.adoptee.site = site;
    };

    if($routeParams.id !== '0') {
        Adoptee.get({ _id: $routeParams.id }).$promise.then(function(retVal){
          if (retVal.error){
            mvNotifier.notify(retVal.error);
          }
          else{
            $scope.adoptee = retVal;
            //console.log($scope.adoptee.birthDate);

            $scope.adoptee.birthDate = $filter('date')($filter('iso2UTC')($scope.adoptee.birthDate), 'yyyy-MM-dd');
            //console.log($scope.adoptee.birthDate);
            $scope.adoptee.intakeDate = $filter('date')($filter('iso2UTC')($scope.adoptee.intakeDate), 'yyyy-MM-dd');
          }
         });
    }
    else {
        $scope.setNewAdoptee();
    }

    $scope.update = function(form, nextFlag, readyToMatch){
      if(form.$invalid) {
        $scope.submitted = true;
        mvNotifier.notify('Invalid fields present');
        return;
      }
      //get next adoptee
      $scope.nextFlag = nextFlag;
      if($scope.adoptee.status != "Matched") {
          $scope.adoptee.status = readyToMatch ? "Not Matched" : "In Process";
      }
      if ($scope.adoptee.applicationNumber)
      {
            $scope.adopteeUpdate();
      } else {
          AdopteeApplicationCounter.getNextSequence().$promise.then(function (retVal) {
              if (retVal.error) {
                  mvNotifier.notify(retVal.error);
              }
              else {
                  $scope.adoptee.applicationNumber = retVal.seq;
                  $scope.adopteeUpdate();
              }
          });
      }
    };

    $scope.addHouseholdMember = function(){
      if (!$scope.adoptee.householdMembers)
      {
        $scope.adoptee.householdMembers = [];
      }
      $scope.adoptee.householdMembers.push({});
    };

    $scope.deleteHouseholdMember = function(householdMember){
        var i = $scope.adoptee.householdMembers.indexOf(householdMember);
        if (i != -1)
        {
            $scope.adoptee.householdMembers.splice(i,1);
        }
    };

    //Expects adoptees to have consecutive numbers
    $scope.adopteeUpdate = function(){
        //$scope.adoptee.birthDate = new Date($scope.adoptee.birthDate).toISOString();
        Adoptee.updateAdoptee($scope.adoptee).$promise.then(function (retVal) {
            if (retVal.error) {
                mvNotifier.notify(retVal.error);
            }
            else {
                mvNotifier.notify(retVal.firstName + ' ' + retVal.lastName + ' successfully saved!');
                $scope.adopteeTitle = '';
                if ($scope.nextFlag) {
                    Adoptee.getNextAdoptee({nextNumber: retVal.applicationNumber + 1}).$promise.then(function(nextVal){
                        if (!nextVal._id || nextVal.error){
                           mvNotifier.notify(retVal.firstName + ' ' + retVal.lastName + " is the highest numbered Adoptee")
                        }
                        else {
                            $scope.adoptee = nextVal;
                            $scope.adoptee.birthDate = $filter('date')($filter('iso2UTC')($scope.adoptee.birthDate), 'yyyy-MM-dd');
                            $scope.adoptee.intakeDate = $filter('date')($scope.adoptee.intakeDate, 'yyyy-MM-dd');
                            $location.path('/adoptees/' + nextVal._id);
                        }
                    });
                }
                else{
                    $scope.adoptee = retVal;
                    $scope.adoptee.birthDate = $filter('date')($filter('iso2UTC')($scope.adoptee.birthDate), 'yyyy-MM-dd');
                    $scope.adoptee.intakeDate = $filter('date')($filter('iso2UTC')($scope.adoptee.intakeDate), 'yyyy-MM-dd');
                    $location.path('/adoptees');
                }
            }
        });
    };

    $scope.cancel = function() {
      $location.path('/adoptees');
    };

    $scope.setFlags = common.setFlags;

  });