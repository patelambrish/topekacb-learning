var mongoose = require('mongoose'),
    PrintEmail = mongoose.model('PrintEmail'),
    fs = require('fs'),
    jade = require('jade'),
    htmlUtil = require('../utilities/adopteeHtml'),
    Adopter = mongoose.model('Adopter');

var pdf = require('html-pdf');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('../config/config')[env];

console.log(config.sendGridUser);
console.log(config.sendGridPassword);
var sendgrid = require('sendgrid')(config.sendGridUser, config.sendGridPassword);

function getAdopterHtml(adopter, templateData) {
	var completeHtml = '',
	    html;
	if (adopter.adoptees && adopter.adoptees.length > 0) {
		adopter.adoptees.forEach(function(adoptee) {
			adoptee.adopter = {
				name : adopter.name,
				email : adopter.email,
				address : adopter.address,
				phones : adopter.phones,
				notifyMethods : adopter.notifyMethods
			};
			html = htmlUtil.getAdopteeHtml(adoptee, templateData);
			completeHtml = completeHtml + html;
		});
	}
	return completeHtml;
}

exports.getPrintEmailRequests = function(req, res, next) {

	PrintEmail.find({}).populate('adopter', 'name org').populate('createdBy', 'firstName lastName').populate('updatedBy', 'firstName lastName').select('-html').exec(function(err, collection) {
		res.send(collection);
	});

};

exports.createPrintEmailRequest = function(req, res, next) {
	var data = req.body,
	    userId = req.user ? req.user._id : null;

	data.createDate = new Date();
	data.createdBy = userId;

	Adopter.findById(data.adopter).exec(function(err, ad) {
		if (err) {
			console.log(err);
			return next(err);
		}
		if (!ad) {
			res.send({
				error : "Error: Adopter not found. Please try again."
			});
		} else {
			PrintEmail.create(data, function(err, peReq) {
				res.send(peReq);
			});
		}
	});
};

exports.updatePrintEmailRequest = function(req, res, next) {
	var update = req.body,
	    id = update._id,
	    userId = req.user ? req.user._id : null;

	update.updateDate = new Date();
	update.updateUser = userId;

	PrintEmail.findByIdAndUpdate(id, update).exec(function(err, printEmailReq) {
		if (err) {
			res.status(400);
			return res.send({
				error : err.toString()
			});
		}
		return res.send(printEmailReq);
	});
};

exports.print = function(req, res, next) {
	var requestId = req.params.id;
	console.log("requestId: " + requestId);
	fs.readFile('server/views/adopteePrint.jade', 'utf8', function(err, templateData) {
		PrintEmail.findById(requestId).exec(function(err, printEmailRequest) {
			if (err) {
				console.log(err);
				return next(err);
			}
			var adopter = printEmailRequest.adopter;
			Adopter.findById(printEmailRequest.adopter).populate('adoptees', '-image').exec(function(err, completeAdopter) {
				if (err) {
					console.log(err);
					return next(err);
				}

				if (completeAdopter) {

					var completeHtml = getAdopterHtml(completeAdopter, templateData);

					printEmailRequest.status = 'Complete';
					printEmailRequest.updateDate = new Date();
					printEmailRequest.updateUser = req.user._id;
					printEmailRequest.html = completeHtml;

					printEmailRequest.save(function(err) {
						if (err) {
							console.log(err);
							return next(err);
						}
						res.status(200);
						res.send(completeHtml);
					});
				} else {
					res.send("Error: Adopter not found. Please try again.");
				}
			});
		});
	});
};

exports.email = function(req, res, next) {
	var adopterId = req.params.id;
	fs.readFile('server/views/adopteePrint.jade', 'utf8', function(err, templateData) {
		Adopter.findById(adopterId).populate('adoptees').exec(function(err, adopter) {
			if (err) {
				console.log(err);
				return next(err);
			}

			if (adopter && (adopter.email || adopter.email2)) {

				var completeHtml = getAdopterHtml(adopter, templateData),
				    printEmailRequest = {};
				printEmailRequest.createDate = new Date();
				printEmailRequest.createdBy = req.user._id;
				printEmailRequest.jobType = 'Email';
				printEmailRequest.emailTo = [];
				if(adopter.email) {
					printEmailRequest.emailTo.push(adopter.email);
				}
				if(adopter.email2) {
					printEmailRequest.emailTo.push(adopter.email2);
				}
				adopter.email;
				printEmailRequest.adopter = adopter._id;
				printEmailRequest.status = 'Complete';
				printEmailRequest.html = completeHtml;
				var emailTo =[];
				if (config.emailTo) {
					emailTo.push(config.emailTo);
				} else {
					emailTo = printEmailRequest.emailTo;
				}

				pdf.create(completeHtml).toBuffer(function(err, buffer) {

					var email = new sendgrid.Email({
						to : emailTo,
						from : config.emailFrom,
						subject : config.emailSubject,
						html : 'Dear Adopter, <br/><br/> Thank you so much for adopting a family this year through the community Christmas Bureau. With your generosity we will be able to make sure our community friends have Christmas for their family. <br/><br/> To help you with what to do next please attached find an informational letter along with  a list of your family or families you have adopted for this holiday season. <br/><br/> If you have any questions or comments please do not hesitate to contact the Christmas Bureau staff at (785) 228-5120 or cb@unitedwaytopeka.org. <br/><br/> Thank you again and Merry Christmas to you and your family. <br/><br/>Brett Martin<br/>Christmas Bureau<br/>United Way of Greater Topeka.',
						files : [{
									filename: 'Family Cost Table.pdf',
									path: 'server/content/Family Cost Table.pdf'
								},
								{
									filename: 'Adopters FAQ.pdf',
									path: 'server/content/Adopters FAQ.pdf'
								},
								{
									filename : 'Adoptee List.pdf',
									content : buffer
								}]						
					});
					email.setHeaders({'Read-Receipt-To': emailTo[0]});   
					email.setHeaders({'X-Confirm-reading-to': emailTo[0]}); 
					email.setHeaders({'Disposition-Notification-To': emailTo[0]}); 
					sendgrid.send(email, function(err, json) {
						if (err) {
							console.error(err);
							return next(err);
						}
						console.log(json);
						PrintEmail.create(printEmailRequest, function(err, newRequest) {
							if (err) {
								console.log(err);
								return next(err);
							}
							res.status(200);
							res.send(newRequest);
						});
					});
				});

			} else {
				res.send({
					error : "Error: Adopter not found or Adopter email address not available. Please try again."
				});
			}

		});
	});
};

exports.preview = function(req, res, next) {

	var reqId = req.params.id;
	PrintEmail.findById(reqId).exec(function(err, req) {
		if (err) {
			console.log(err);
			return next(err);
		}
		res.status(200);
		res.send(req.html);
	});
};

