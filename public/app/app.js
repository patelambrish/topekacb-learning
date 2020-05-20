angular.module('app', ['ngResource', 'ngRoute','googlechart','textAngular']);

angular.module('app').config(function($routeProvider, $locationProvider) {
	var routeRoleChecks = {
		admin : {
			auth : function(mvAuth) {
				return mvAuth.authorizeCurrentUserForRoute('admin')
			}
		},
		user : {
			auth : function(mvAuth) {
				return mvAuth.authorizeAuthenticatedUserForRoute()
			}
		}
	}

	$locationProvider.html5Mode(true);
	$routeProvider.when('/', {
		templateUrl : '/partials/main/main',
		controller : 'mvMainCtrl'
	}).when('/admin/users', {
		templateUrl : '/partials/admin/manage-users',
		controller : 'UserListCtrl',
		resolve : routeRoleChecks.admin
	})
	//.when('/signup', { templateUrl: '/partials/account/signup',
	//  controller: 'mvSignupCtrl'
	//})
	//.when('/profile', { templateUrl: '/partials/account/profile',
	//  controller: 'mvProfileCtrl', resolve: routeRoleChecks.user
	//})
	.when('/adoptees', {
		templateUrl : '/partials/adoptees/adoptee-list',
		controller : 'adopteeListCtrl',
		resolve : routeRoleChecks.user,
		reloadOnSearch : false
	}).when('/adoptees/:id', {
		templateUrl : '/partials/adoptees/adoptee-details',
		controller : 'adopteeDetailCtrl',
		resolve : routeRoleChecks.user
    }).when('/adoptees/:id/form', {
        controller: 'adopteeDetailCtrl',
        resolve : routeRoleChecks.user
	}).when('/adopters', {
		templateUrl : '/partials/adopters/adopter-list',
		controller : 'AdopterListCtrl',
		resolve : routeRoleChecks.user,
		reloadOnSearch : false
	}).when('/adopters/:id', {
		templateUrl : '/partials/adopters/adopter-details',
		controller : 'AdopterDetailCtrl',
		resolve : routeRoleChecks.user
	}).when('/facebook/:message', {
		resolve : {
			data : ['$route', '$location', 'mvSharedContext',
			function($route, $location, mvSharedContext) {
				mvSharedContext.clearContext();
				mvSharedContext.message($route.current.params.message);
				$location.path('/');
			}]
		}
	}).when('/match', {
		templateUrl: 'partials/matching/match',
		controller: 'mvMatchCtrl',
		resolve : routeRoleChecks.user
	}).when('/duplicates', {
		templateUrl: '/partials/adoptees/adoptee-duplicates',
		controller: 'AdopteeDupsCtrl',
		resolve : routeRoleChecks.user
	}).when('/printemail', {
		templateUrl: 'partials/printemail/printemaillist',
		controller: 'PrintEmailController',
		resolve: routeRoleChecks.user
	}).	otherwise({
		redirectTo : '/'
	});
});

angular.module('app').run(function($rootScope, $location) {
	$rootScope.$on('$routeChangeError', function(evt, current, previous, rejection) {
		if (rejection === 'not authorized') {
			$location.path('/');
		}
	})
})
