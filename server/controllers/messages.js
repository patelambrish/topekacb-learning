var Message = require('mongoose').model('Message');

exports.getMessage = function(req, res) {
  //console.log(req.params.type);
  Message.findOne({ type: req.params.type }).exec(function(err, msg) {
    res.send(msg);
  });
};

exports.updateMessage = function(req, res) {
  var messageUpdates = req.body;

  if(!req.user.hasRole('admin')) {
    res.status(403);
    return res.end();
  }

  Message.findOne({_id: messageUpdates._id}).exec(function(err, curMsg) {
    curMsg.value = messageUpdates.value;
  	curMsg.save(function(err){
  		if(err) { res.status(400); return res.send({reason:err.toString()});}
    	res.send({
    		_id: curMsg._id,
    		type: curMsg.type,
    		value: curMsg.value
    	});
  	})
  });
};