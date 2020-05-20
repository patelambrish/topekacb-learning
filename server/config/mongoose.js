var mongoose = require('mongoose'),
    userModel = require('../models/User'),
    adopteeModel = require('../models/Adoptee'),
    adopterModel = require('../models/Adopter'),
    stateModel = require('../models/State'),
    messageModel = require('../models/Message'),
    adopteeApplicationCounterModel = require('../models/AdopteeApplicationCounter'),
    printEmailModel = require('../models/PrintEmail.js');

module.exports = function(config) {
  mongoose.connect(config.db);
  var db = mongoose.connection,
      sampleAdopters, sampleAdoptees;
    
  db.on('error', console.error.bind(console, 'connection error...'));
  db.once('open', function callback() {
    console.log('topekaCb db opened');
  });

  console.log("Environment:  " + process.env.NODE_ENV);

  if(process.env.NODE_ENV == 'development' || process.env.NODE_ENV == 'test') {
    userModel.createDefaultUsers();
    stateModel.createStates();

    adopterModel.createSampleAdopters().
      then(function(data) {
        sampleAdopters = data;
        return adopteeModel.createSampleAdoptees();
      }).
      then(function(data) {
        sampleAdoptees = data.filter(function(a) {
          return a.status === 'Not Matched';
        });
        sampleAdoptees.length = Math.floor(sampleAdoptees.length * 0.88);
        console.log('Creating sample matches from a pool of ' + sampleAdoptees.length + ' adoptees...');
        sampleAdopters.forEach(function(adopter) {
          adopterModel.createSampleMatch(adopter, sampleAdoptees);
        });
        process.stdout.write('\n');
        console.log('Successfully completed sample matching.');
      });

    adopteeApplicationCounterModel.initializeAdopteeApplicationCounter();
    messageModel.createMessages();
  }

  adopteeModel.startOrphanedUpdateChecking();
};
