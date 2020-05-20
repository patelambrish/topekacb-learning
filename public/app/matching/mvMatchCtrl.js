angular.module('app').controller('mvMatchCtrl', ['$scope', '$filter', 'mvNotifier', 'Adopter', 'Adoptee', 'AdopterPrintEmailService', 'AdopterEmailService','mvIdentity',
function($scope, $filter, mvNotifier, Adopter, Adoptee, AdopterPrintEmailService, AdopterEmailService, mvIdentity) {
	$scope.permission = {
      	delete: mvIdentity.isAuthorized('manager'),
      	readonly: mvIdentity.isAuthorized('observer')
    };
	$scope.template = {
		adopterMatchUrl : '/partials/matching/adopter-match'
	};
	$scope.adopterFields = {
		count: false,
		memberCount: false
	};
	$scope.adopterSearchResults = [];
	$scope.adopteeSearchResults = [];
	$scope.currentAdopter;
	$scope.currentAdoptee;
	$scope.ageRanges = ["0-7", "8-12", "13-18"];
	$scope.adopteeEnums;
	$scope.adopteeAges = [];
    $scope.useFilter = false;

	$scope.applyPage = function(page, data, pageInfo) {
		pageInfo.current = page;
		if (data && data.totalCount) {
			pageInfo.total = Math.ceil(data.totalCount / pageInfo.size);
		}
		pageInfo.previous = page > 1 ? page - 1 : page;
		pageInfo.next = page < pageInfo.total ? page + 1 : page;

	};

	$scope.getAdopterPage = function(page) {
		$scope.adopterPage.current = page;
		$scope.searchAdopters();
	};

	$scope.getAdopteePage = function(page) {
        $scope.adopteePage.current = page;
        $scope.searchAdoptees();
	};

	$scope.selectAdoptee = function(selectedAdoptee) {
		// getting from server because search adoptee is not fully hydrated. eg,
		// household members not included w/ search adoptee for performance reasons.
		$scope.currentAdoptee = Adoptee.get({
			_id : selectedAdoptee._id
		});
		$scope.adopteeAges = [];

		$scope.currentAdoptee.$promise.then(function(data) {
			data.householdMembers.forEach(function(member) {
				if (member.age < 8 && $scope.adopteeAges.indexOf($scope.ageRanges[0]) == -1) {
					$scope.adopteeAges.push($scope.ageRanges[0]);
				}
				if (member.age > 7 && member.age < 13 && $scope.adopteeAges.indexOf($scope.ageRanges[1]) == -1) {
					$scope.adopteeAges.push($scope.ageRanges[1]);
				}
				if (member.age > 12 && member.age < 19 && $scope.adopteeAges.indexOf($scope.ageRanges[2]) == -1) {
					$scope.adopteeAges.push($scope.ageRanges[2]);
				}
			});
		});
	};

	$scope.bulkMatch = function() {
		var criteria = $scope.currentAdopter.criteria;
		criteria['status'] = "Not Matched";
		Adoptee.query({
			filter : criteria,
			start : 0,
			limit : $scope.currentAdopter.criteria.count - $scope.currentAdopter.adoptees.length
		}).$promise.then(function(res) {
			var searchResults = res.data;
			if ($scope.currentAdopter.criteria.count == $scope.currentAdopter.adoptees.length) {
				mvNotifier.notify($scope.currentAdopter.name + " is fully matched.");
			} else {
			    mvNotifier.notify('Bulk matching ' + $scope.currentAdopter.name + " with available adoptees.");
			    var tempAdoptees = [];
                $scope.currentAdopter.adoptees.forEach(function (existingAdoptee){
                    tempAdoptees.push(existingAdoptee._id);
                });
				searchResults.forEach(function(a) {
					a._adopterId = $scope.currentAdopter._id;
					a.status = "Matched";
					Adoptee.matchAdoptee(a).$promise.then(function(res) {
                        if(res.error){
                            mvNotifier.notify(res.error);
                        }else {
                            tempAdoptees.push(a._id);
                            if ($scope.currentAdopter.criteria.count == $scope.currentAdopter.adoptees.length) {
                              $scope.currentAdopter.status = "Matched";
                            }
             	            var updatedAdopter = $scope.currentAdopter;
             	            updatedAdopter.adoptees = tempAdoptees;
                            Adopter.save(updatedAdopter).$promise.then(function (retVal) {
                                if (retVal.error) {
                                    mvNotifier.notify(retVal.error);
                                }else{
                                    $scope.currentAdopter = retVal;
                                }
                            });
                        }
                        if ($scope.currentAdopter.criteria.count == $scope.currentAdopter.adoptees.length) {
				            $scope.searchAdoptees();
                        }
                    });
				});
			}
		});
	};

	$scope.matchAdoptee = function() {
        if ($scope.currentAdopter.criteria.count == $scope.currentAdopter.adoptees.length) {
            mvNotifier.notify($scope.currentAdopter.name + " is fully matched.");
        } else {
            $scope.currentAdoptee._adopterId = $scope.currentAdopter._id;
            $scope.currentAdoptee.status = "Matched";
            Adoptee.matchAdoptee($scope.currentAdoptee).$promise.then(function (retAdoptee) {
                if (retAdoptee.error) {
                    mvNotifier.notifyError(retAdoptee.error);
                } else {
                    $scope.currentAdoptee = retAdoptee;
                    var tempAdoptees = [];
                    $scope.currentAdopter.adoptees.forEach(function(attachedAdoptee){
                      tempAdoptees.push(attachedAdoptee._id);
                    });
                    tempAdoptees.push(retAdoptee._id);
                    var updatedAdopter = $scope.currentAdopter;
                    updatedAdopter.adoptees = tempAdoptees;
                    if (updatedAdopter.adoptees.length == updatedAdopter.criteria.count) {
                        updatedAdopter.status = "Matched";
                    }
                    Adopter.save(updatedAdopter).$promise.then(function (retAdopter) {
                        if (retAdopter.error) {
                            mvNotifier.notify(retAdopter.error);
                        } else {
                            $scope.currentAdopter = retAdopter;
                            mvNotifier.notify($scope.currentAdoptee.firstName + ' ' + $scope.currentAdoptee.lastName + ' matched with ' + $scope.currentAdopter.name + '!');
                        }
                        $scope.searchAdoptees();
                    });
                }
            });
        }
    };


  $scope.selectAdopter = function(adopter) {
      Adopter.get({
        id : adopter._id
      }).$promise.then(function(data) {
        $scope.currentAdopter = data;
        $scope.adopteeFilter = {};
        $scope.searchAdoptees();
        $scope.useFilter = false;
      });
    };


	function getNewPrintEmailRequest(reqType) {
		var newReq = new AdopterPrintEmailService();
		newReq.status = "Not Complete";
		newReq.jobType = reqType;
		return newReq;
	}


	$scope.emailAdopter = function(adopter) {
		var req = getNewPrintEmailRequest('Email');
		req.adopter = adopter._id;
		AdopterEmailService.get({id:adopter._id}).$promise.then(function(res) {
			if(res.error) {
				mvNotifier.notifyError(res.error);
			}
			else {
				mvNotifier.notify('Email is sent successfully!');
			}
		})['catch'](function() {
			mvNotifier.notifyError('An error occurred while sending email!');
		});
	};

	$scope.printAdopter = function(adopter) {
		var req = getNewPrintEmailRequest('Print');
		req.adopter = adopter._id;
		AdopterPrintEmailService.create(req).$promise.then(function(res) {
			if(res.error) {
				mvNotifier.notifyError(res.error);
			}
			else {
				mvNotifier.notify('Print item added to queue successfully!');
			}
		})['catch'](function() {
			mvNotifier.notifyError('An error occurred while create item in Print queue!');
		});
	};
	
	$scope.criteriaChange = function(newValue, oldValue) {
    $scope.searchAdoptees();
	};
}]);