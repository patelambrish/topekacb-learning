angular.module('app')
    .factory('mvSharedContext', function() {
        function Context() {
            var _message = null;

            this.message = function(value) {
                if(!arguments.length) {
                    return _message;
                } else {
                    _message = value;
                }
            };

            this.clearContext = function() {
                _message = null;
            };

        }

        return new Context();
    });