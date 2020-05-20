angular.module('app').controller('mvNavBarLoginCtrl', function($scope, $http, mvIdentity, mvNotifier, mvAuth, cbCurrentSite, $location, $window) {
	$scope.identity = mvIdentity;

	$scope.signin = function(username, password) {
		mvAuth.authenticateUser(username, password).then(function(success) {
			if (success) {
				mvNotifier.notify('You have successfully signed in!');
			} else {
				mvNotifier.notify('Username/Password combination incorrect');
			}
		});
	};

	$scope.signout = function() {
		mvAuth.logoutUser().then(function() {
			$scope.username = "";
			$scope.password = "";
      cbCurrentSite.clear();
			mvNotifier.notify('You have successfully signed out!');
			$location.path('/');
		});
	};

	$scope.loginViaFacebook = function() {
		var redirectUri = $window.location.protocol + '//' + $window.location.host + '/auth/facebook';
		$window.location.href = redirectUri;
	};

});