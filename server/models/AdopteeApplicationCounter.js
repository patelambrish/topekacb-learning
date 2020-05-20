var mongoose = require('mongoose');

var adopteeApplicationCounterSchema = mongoose.Schema({
      _id: {type: String},
      seq: {type: Number}

    });

var AdopteeApplicationCounter = mongoose.model('AdopteeApplicationCounter', adopteeApplicationCounterSchema);

function initializeAdopteeApplicationCounter() {
  AdopteeApplicationCounter.find({}).exec(function(err, collection) {
    if(collection.length === 0) {
      AdopteeApplicationCounter.create({
        _id: 'adopteeApplication',
        seq: 4000});
    }
  });
}

exports.initializeAdopteeApplicationCounter = initializeAdopteeApplicationCounter;