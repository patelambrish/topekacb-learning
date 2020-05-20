var State = require('mongoose').model('State');

exports.getStates = function(req, res) {
    State.find({}).exec(function(err, collection) {
        res.send(collection);
    })
};