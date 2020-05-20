var User = require('mongoose').model('User'), encrypt = require('../utilities/encryption');

function isValidPassword(pwd) {
	if (pwd.length < 6) {
		return false;
	} else if (pwd.search(/\d/) == -1 && pwd.search(/[!@#$%^&*(){}[\]<>?/|.:;_-]/) == -1) {
		return false;
	} else {
		return true;
	}
}

exports.getUsers = function(req, res) {
	//console.log(req.query);
	User.find({}, {
		username : 1,
		firstName : 1,
		lastName : 1,
		active : 1,
		facebook : 1,
		roles : 1
	}).exec(function(err, collection) {
		res.send(collection);
	});
};

exports.createUser = function(req, res, next) {
	var userData = req.body;
	userData.username = userData.username.toLowerCase();
	userData.salt = encrypt.createSalt();
	if (!isValidPassword(userData.password)) {
		var err = new Error("Password must be at least 6 characters long and contain at least one special character or number");
		res.status(400);
		return res.send({
			reason : err.toString()
		});
	}
	userData.hashed_pwd = encrypt.hashPwd(userData.salt, userData.password);
	User.create(userData, function(err, user) {
		if (err) {
			if (err.toString().indexOf('E11000') > -1) {
				err = new Error('Duplicate Username');
			}
			res.status(400);
			return res.send({
				reason : err.toString()
			});
		}
		res.send({
			_id : user._id,
			username : user.username,
			firstName : user.firstName,
			lastName : user.lastName,
			active : user.active,
			facebook : user.facebook,
			roles : user.roles
		});

	});
};

exports.updateUser = function(req, res) {
	var userUpdates = req.body;

	if (!req.user.hasRole('admin')) {
		res.status(403);
		return res.end();
	}

	User.findOne({
		_id : userUpdates._id
	}).exec(function(err, curUser) {
		curUser.firstName = userUpdates.firstName;
		curUser.lastName = userUpdates.lastName;
		curUser.username = userUpdates.username;
		curUser.active = userUpdates.active;
		curUser.roles = userUpdates.roles;
		if (userUpdates.password && userUpdates.password.length > 0) {
			if (!isValidPassword(userUpdates.password)) {
				var err = new Error("Password must be at least 6 characters long and contain at least one special character or number");
				res.status(400);
				return res.send({
					reason : err.toString()
				});
			}
			curUser.salt = encrypt.createSalt();
			curUser.hashed_pwd = encrypt.hashPwd(curUser.salt, userUpdates.password);
		}
		curUser.save(function(err) {
			if (err) {
				res.status(400);
				return res.send({
					reason : err.toString()
				});
			}
			res.send({
				_id : curUser._id,
				username : curUser.username,
				firstName : curUser.firstName,
				lastName : curUser.lastName,
				active : curUser.active,
				facebook : curUser.facebook,
				roles : curUser.roles
			});
		})
	});
};