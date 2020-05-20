var mongoose = require('mongoose'),
    encrypt = require('../utilities/encryption');

var userSchema = mongoose.Schema({
  firstName: {type:String, required:'{PATH} is required!'},
  lastName: {type:String, required:'{PATH} is required!'},
  username: {
    type: String,
    required: '{PATH} is required!',
    unique:true
  },
  salt: {type:String},
  hashed_pwd: {type:String},
  roles: [String],
  facebook: {},
  active: {type: Boolean, required:'{PATH} is required!'}
});

userSchema.methods = {
  authenticate: function(passwordToMatch) {
    return encrypt.hashPwd(this.salt, passwordToMatch) === this.hashed_pwd;
  },
  hasRole: function(role) {
    return this.roles.indexOf(role) > -1;
  }
};
var User = mongoose.model('User', userSchema);

function createDefaultUsers() {
  User.find({}).exec(function(err, collection) {
    if(collection.length === 0) {
      var salt, hash;
      salt = encrypt.createSalt();
      hash = encrypt.hashPwd(salt, 'susan');
      User.create({firstName:'Susan',lastName:'Enneking',username:'susan.enneking@se2.com', salt: salt, hashed_pwd: hash, roles: ['admin', 'user'], active: true});
      salt = encrypt.createSalt();
      hash = encrypt.hashPwd(salt, 'nick');
      User.create({firstName:'Nick',lastName:'Xidis',username:'nick.xidis@se2.com', salt: salt, hashed_pwd: hash, roles: ['manager', 'user'], active: true});
      salt = encrypt.createSalt();
      hash = encrypt.hashPwd(salt, 'ambrish');
      User.create({firstName:'Ambrish',lastName:'Patel',username:'ambrish.patel@se2.com', salt: salt, hashed_pwd: hash, roles: ['user'], active: true});
    }
  })
  console.log('Users Created');
}

exports.createDefaultUsers = createDefaultUsers;