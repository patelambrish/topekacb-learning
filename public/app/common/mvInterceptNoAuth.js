angular.module('app').factory("HttpErrorInterceptorModule", ["$q", "$rootScope", "$location", "mvIdentity",
    function($q, $rootScope, $location, mvIdentity) {
        var success = function(response) {
            // pass through
            return response;
        },
            error = function(response) {
                if(response.status === 403) {
                	mvIdentity.currentUser = null;
                    $location.path('/');
                }

                return $q.reject(response);
            };

        return function(httpPromise) {
            return httpPromise.then(success, error);
        };
    }
]).config(["$httpProvider",
    function($httpProvider) {
        $httpProvider.responseInterceptors.push("HttpErrorInterceptorModule");
    }
]);