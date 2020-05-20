angular.module('app').directive('userList', function() {
	return {
		templateUrl : '/partials/admin/user-list',
		link : function(scope, element) {
			var mdialog = element.find('.modal');

			function isValidPassword(pwd) {
				if (pwd.length < 6) {
					return false;
				} else if (pwd.search(/\d/) == -1 && pwd.search(/[!@#$%^&*(){}[\]<>?/|.:;_-]/) == -1) {
					return false;
				} else {
					return true;
				}
			}


			scope.closeModal = function() {
				mdialog.modal('hide');
			};

			mdialog.on('show.bs.modal', function() {
				scope.userForm.$setPristine();
				scope.$digest();
			});

			scope.validatePassword = function(pwd) {
				if (pwd && pwd !== '') {
					var isValid = isValidPassword(pwd);
					if(isValid === true) {
						scope.userForm.password.$invalid = false;
					}
					else if(isValid === false) {
						scope.userForm.password.$invalid = true;
					}
				} else {
					scope.userForm.password.$invalid = false;
				}
			};

		}
	};
});
