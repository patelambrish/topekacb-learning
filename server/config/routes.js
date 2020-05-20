var auth = require('./auth'),
    users = require('../controllers/users'),
    adoptees = require('../controllers/adoptees'),
    adopters = require('../controllers/adopters'),
    states = require('../controllers/states'),
    adopteeApplicationCounter = require('../controllers/adopteeApplicationCounter'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    passport = require('passport'),
    messages = require('../controllers/messages'),
    printEmail = require('../controllers/printEmailRequest');

module.exports = function(app) {

  app.get('/api/users', auth.requiresRole(['admin']), users.getUsers);
  app.post('/api/users', auth.requiresRole(['admin']), users.createUser);
  app.put('/api/users', auth.requiresRole(['admin']), users.updateUser);

  app.get('/api/adoptees/duplicates', auth.requiresRole(['observer','user','manager']), adoptees.getAdopteeDups);
  app.get('/api/adoptees', auth.requiresRole(['observer','user','manager','adopter']), adoptees.getAdoptees);
  app.get('/api/adoptees/:id', auth.requiresRole(['observer','user','manager','adopter']), adoptees.getAdopteeById);
  app.post('/api/adoptees', auth.requiresRole(['observer','user','manager']), adoptees.getNextAdoptee);
  app.get('/api/adoptees/:id/enums', auth.requiresRole(['observer','user','manager','adopter']), adoptees.getEnums);
  app.get('/api/adoptees/:id/form', auth.requiresRole(['observer','user','manager','adopter']), adoptees.getForm);
  app.put('/api/adoptees', auth.requiresRole(['user','manager']), adoptees.updateAdoptee);
  app.put('/api/adoptees/match', auth.requiresRole(['user','manager']), adoptees.matchAdoptee);
  app.delete('/api/adoptees/:id', auth.requiresRole(['manager']), adoptees.deleteAdoptee);

  app.get('/api/adoptees/:id/print', auth.requiresRole(['observer','user','manager']), adoptees.print);

  app.get('/api/chartdata', adoptees.getAggregateHouseholdTypes);
  app.get('/api/chartdata/bar', adoptees.getAggregateAdoptedCounts);
  app.get('/api/stats/specialNeeds', adoptees.getAggregateSpecialNeeds);
  app.get('/api/stats/age', adoptees.getAgeAggregation);

  app.get('/api/adopters', auth.requiresRole(['observer','user','manager']), adopters.getAdopters);
  app.get('/api/adopters/:id', auth.requiresRole(['observer','user','manager']), adopters.getAdopterById);
  app.get('/api/adopters/:id/enums', auth.requiresRole(['observer','user','manager']), adopters.getEnums);
  app.post('/api/adopters', auth.requiresRole(['user','manager']), adopters.saveAdopter);
  app.delete('/api/adopters/:id', auth.requiresRole(['manager']), adopters.deleteAdopter);
  app.delete('/api/adopters/:id/adoptees/:adopteeId', auth.requiresRole(['user','manager']), adopters.removeAdoptee);
  app.get('/api/adopters/print/:id', auth.requiresRole(['observer','user','manager']), adopters.print);
  app.get('/api/printemails', auth.requiresRole(['observer','user','manager']), printEmail.getPrintEmailRequests);
  app.post('/api/printemails', auth.requiresRole(['observer','user','manager']), printEmail.createPrintEmailRequest);
  app.get('/api/printemails/:id', auth.requiresRole(['observer', 'user','manager']), printEmail.preview);
  app.get('/api/print/:id', auth.requiresRole(['observer','user','manager']), printEmail.print);
  app.get('/api/email/:id', auth.requiresRole(['observer','user','manager']), printEmail.email);

  app.get('/api/states', states.getStates);

  app.get('/api/adopteeapplicationcounter', adopteeApplicationCounter.getNextSequence);

  app.get('/api/messages/:type', messages.getMessage);
  app.put('/api/messages', auth.requiresRole(['admin']), messages.updateMessage);


  app.get('/partials/*', function(req, res) {
    res.render('../../public/app/' + req.params[0]);
  });

  app.post('/login', auth.authenticate);

  app.post('/logout', function(req, res) {
    req.logout();
    res.end();
  });

  app.all('/api/*', function(req, res) {
    res.send(404);
  });

  app.get('/auth/facebook', passport.authenticate('facebook'));

  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/facebook/You are registered. Please contact system administrator!', successRedirect: '/facebook/You have successfully signed in!'
  }));

  app.get('*', function(req, res) {
    var rUser;
    if(req.user) {
      rUser = {
        username: req.user.username,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        id: req.user._id,
        roles: req.user.roles
      };
    }
    res.render('index', {
      bootstrappedUser : rUser
    });
  });
};
