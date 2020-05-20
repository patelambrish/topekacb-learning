var passport = require('passport'), mongoose = require('mongoose'), LocalStrategy = require('passport-local').Strategy, User = mongoose.model('User'), FacebookStrategy = require('passport-facebook').Strategy;

module.exports = function(config) {
  passport.use(new LocalStrategy(function(username, password, done) {
    User.findOne({
      $and : [{
        username : username
      }, {
        active : true
      }]
    }).exec(function(err, user) {
      if (user && user.authenticate(password)) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    })
  }));

  passport.use(new FacebookStrategy({
    clientID : config.faceBookClientID,
    clientSecret : config.faceBookClientSecret,
    callbackURL : config.faceBookCallbackURL
  }, function(accessToken, refreshToken, profile, done) {
    /*process.nextTick(function() {
     return done(null, profile);
     });*/
    User.findOne({
      'facebook.id' : profile.id
    }, function(err, user) {
      if (err) {
        return done(err);
      }
      //No user was found... so create a new user with values from Facebook (all the profile. stuff)
      if (!user) {
        user = new User({
          firstName : profile.name.givenName,
          username : profile.id,
          //email: profile.emails[0].value,
          lastName : profile.name.familyName,
          provider : 'facebook',
          //now in the future searching on User.findOne({'facebook.id': profile.id } will match because of this next line
          facebook : profile._json,
          active : false
        });
        user.save(function(err) {
          if (err) {
            console.log(err);
          } else {
            return done(null, false);
          }
        });
      } else {
        //found user. Return
        if (user.active === true) {
          return done(err, user);
        } else {
          return done(null, false)
        }

      }
    });
  }));

  /*passport.serializeUser(function(user, done) {
   done(null, user);
   });

   passport.deserializeUser(function(user, done) {
   done(null, user);
   });*/

  passport.serializeUser(function(user, done) {
    if (user) {
      //console.log('serialize user' , user);
      done(null, user._id.toString());
    }
  });

  passport.deserializeUser(function(id, done) {
    //console.log('deserialize user ',id);
    User.findOne({
      _id : id
    }).exec(function(err, user) {
      //console.log('Found user by id: ', user);
      //console.log('Error encountered', err);
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    })
  });
}