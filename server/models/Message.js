var mongoose = require('mongoose'),
    stateSchema = mongoose.Schema({
      type: {type: String},
      value: {type: String}
    }),
    message = mongoose.model('Message', stateSchema);

function createMessages() {
  message.find({}).exec(function(err, collection) {
    if(collection.length === 0) {
      message.create({ "type": "HomePageMessage", "value": "<p class=\"lead text-center\">Interested in helping a local family during the holidays this year?<br/>Go to <a href=\"//www.unitedwaytopeka.org/cb\" target=\"_blank\">www.unitedwaytopeka.org/cb</a> to sign up to adopt a family.</p>&#10;<p class=\"lead text-center\">Intake for eligible families is October 31 – November 8.</p>&#10;<div class=\"row\"><div class=\"col-sm-3 col-sm-offset-2\"><a href=\"//www.antiochfamilylifecenter.org/\" target=\"_blank\">Antioch Family Life Center</a><br/>1921 SE Indiana Ave<br/>Topeka, KS 66607<table class=\"table table-condensed\"><thead><tr><th colspan=\"2\">Open Times</th></tr></thead><tbody><tr><td>Oct 31</td><td>9:00 am – 5:00 pm</td></tr><tr><td>Nov 1</td><td>9:00 am – 3:00 pm</td></tr><tr><td>Nov 3 – 7</td><td>9:00 am – 1:00 pm</td></tr><tr><td>Nov 8</td><td>9:00 am – 3:00 pm</td></tr></tbody></table></div><div class=\"col-sm-3 col-sm-offset-2\"><a href=\"//letshelpinc.com/\" target=\"_blank\">Let's Help</a><br/>200 S Kansas Ave<br/>Topeka, KS 66603<table class=\"table table-condensed\"><thead><tr><th colspan=\"2\">Open Times</th></tr></thead><tbody><tr><td>Oct 31</td><td>3:00 pm – 7:00 pm</td></tr><tr><td>Nov 1</td><td>9:00 am – 3:00 pm</td></tr><tr><td>Nov 3 – 7</td><td>3:00 pm – 7:00 pm</td></tr><tr><td>Nov 8</td><td>9:00 am – 3:00 pm</td></tr></tbody></table></div></div>" });
    }
  });
}

exports.createMessages = createMessages;