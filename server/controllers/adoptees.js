var mongoose = require('mongoose'),
    Adoptee = mongoose.model('Adoptee'),
    AdopteeApplicationCounter = mongoose.model('AdopteeApplicationCounter'),
    fs = require('fs'),
    jade=require('jade'),
    htmlUtil = require('../utilities/adopteeHtml'),
    moment=require('moment');

exports.getAdoptees = function(req, res) {
    var searchFilters, query, queryName, sortBy, sortDir;
    if(req.query.filter) {
        searchFilters= JSON.parse(req.query.filter);
    }
   
    query = Adoptee.find({});
    if(searchFilters) {
        if(searchFilters.households && searchFilters.households.length > 0) {                      
            query = query.where('criteria.householdType').in([].concat(searchFilters.households));
            console.log("Index = >", searchFilters.households.indexOf("Spanish Speaker"))
            if(searchFilters.households.indexOf("Spanish Speaker") > 0) {
              query = query.where('language').ne(null);
            }
        }
        if(searchFilters.special && searchFilters.special.length > 0) {
            query = query.where('criteria.specialNeeds').in([].concat(searchFilters.special));
        }
        
        if(searchFilters.members) {
            var cnt = parseInt(searchFilters.members);
            query = query.where({householdMembers : {$exists:true}, $where:'this.householdMembers.length==' + cnt});
          }

        if(searchFilters.status) {
            query = query.where('status').equals(searchFilters.status);
        }
        if(searchFilters.site) {
            query = query.where('site').equals(searchFilters.site);
        }
        if(searchFilters.name && searchFilters.name.length > 0) {
            var phoneCheckRegEx = /((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}/;
            var lastName = searchFilters.name.split(' ')[1];
            var firstName = searchFilters.name.split(' ')[0];
            var tokens = searchFilters.name.split(' ').length;
            var lastNameRegex = new RegExp('^' + lastName, 'i');
            var firstNameRegex = new RegExp('^' + firstName, 'i');
            var nameRegex = new RegExp(searchFilters.name + '*', 'i');
            var queryExec = false;
            if(phoneCheckRegEx.test(searchFilters.name)){
                queryExec = true;
                query = query.where({$or: [
                    {'homePhone.number': searchFilters.name},
                    {'cell1Phone.number': searchFilters.name},
                    {'cell2Phone.number': searchFilters.name},
                    {'otherPhone.number': searchFilters.name}
                ]});
            }
            if (lastName && firstName && tokens === 2 && !queryExec) {
                queryExec = true;
                query = query.where({$and: [
                    {'lastName': lastNameRegex},
                    {'firstName': firstNameRegex}
                ]});
            }
            if (tokens != 2 && !queryExec) {
                query = query.where({$or: [
                    {'lastName': nameRegex},
                    {'firstName': nameRegex},
                    {'criteria.story': nameRegex},
                    {'criteria.volunteerComment': nameRegex},
                    {'criteria.internalComment': nameRegex},
                    {'ssnLastFour': nameRegex},
                    {'householdMembers.wishList': nameRegex},
                    {'householdMembers.name': nameRegex},
                    {'householdMembers.ssnLastFour': nameRegex},
                    {'address.zip': searchFilters.name},
                    {'language': nameRegex}
                ]});
            }
            if(moment(searchFilters.name, 'MM/DD/YYYY').isValid()) {
                var inDate = moment(searchFilters.name,'MM/DD/YYYY').format('YYYY-MM-DD');
                query.where({$or:[
                    {'intakeDate': inDate},
                    {'birthDate': inDate}
                ]});
            }            
        }
        if(searchFilters.childAges && searchFilters.childAges.length > 0){
            var zeroToSeven = [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1, 2, 3, 4, 5, 6, 7];
            var eightToTwelve = [8, 9, 10, 11, 12];
            var thirteenToEighteen = [13, 14, 15, 16, 17, 18];
            var childAges = [];
            searchFilters.childAges.forEach(function(age){
                if(age.split('-')[0] == 0){
                    childAges = childAges.concat(zeroToSeven);
                }
                if(age.split('-')[0] == 8){
                    childAges = childAges.concat(eightToTwelve);
                }
                if(age.split('-')[0] == 13){
                    childAges = childAges.concat(thirteenToEighteen);
                }
            });
            query = query.where('householdMembers.age').in(childAges);
        }
    }
    Adoptee.count(query, function(err, count){
        if(req.query.sort) {
            query = query.sort(req.query.sort);
        }

        if(req.query.start && req.query.limit) {
            query = query.skip(parseInt(req.query.start)).limit(parseInt(req.query.limit));
        }
        query.
            populate('_createUser', 'firstName lastName').
            populate('_modifyUser', 'firstName lastName').
            populate('_adopterId', 'name').
            select({
              firstName: 1,
              lastName: 1,
              gender: 1,
              agent: 1,
              address: 1,
              documentNumber: 1,
              status: 1,
              'criteria.story': 1,
              'criteria.specialNeeds': 1,
              'criteria.householdType': 1,
              applicationNumber: 1,
              householdMembers: 1,
              site: 1,
              createDate: 1,
              '_createUser': 1,
              '_modifyUser': 1,
              '_adopterId': 1
            }).
            exec(function(err, collection) {
                if (err) {
                    res.status(400);
                    return res.send({error: err.toString()});
                }
                res.send({data: collection, totalCount: count});
            });
    });
};

exports.getAdopteeById = function(req, res) {
    var userId = req.user ? req.user._id : null;
    Adoptee.findOne({_id: req.params.id}).
        populate('_adopterId', 'name').
        select('-image').
        exec(function (err, adoptee) {
          if(err) { res.status(400); return res.send({error:err.toString()});}
          if (adoptee.status == "In Process") {
              Adoptee.
                  update({_id: adoptee._id}, {status: "Pulled For View/Update", _modifyUser: userId, modifyDate: new Date()}, {}).
                  exec();
          }
          res.send(adoptee);
    });
};

exports.getNextAdoptee = function(req, res) {
    var userId = req.user ? req.user._id : null;
    Adoptee.findOne({applicationNumber: {$gte : req.body.nextNumber}}).
        populate('_adopterId', 'name').
        select('-image').
        exec(function (err, adoptee) {
        if(err) { res.status(400); return res.send({error:err.toString()});}
        if (adoptee) {
            if (adoptee.status == "In Process") {
                Adoptee.
                    update({_id: adoptee._id}, {status: "Pulled For View/Update", _modifyUser: userId, modifyDate: new Date()}, {}).
                    exec();
            }
            res.send(adoptee);
        }
        else {
            res.send({});
        }
    });
};

exports.getAggregateSpecialNeeds = function(req, res) {
  Adoptee.count({'criteria.specialNeeds': []}, function(err, count) {
    Adoptee.
      aggregate([{
        $project: { 'criteria.specialNeeds': 1 }
      }, {
        $unwind: '$criteria.specialNeeds'
      },{
        $group: {
          _id: '$criteria.specialNeeds',
          count: { $sum: 1 }
        }
      }]).
      exec(function(err, collection) {
        res.send([{_id: 'None', count: count}].concat(collection));
      });
  });
};

exports.getAgeAggregation = function(req, res) {
  Adoptee.aggregate([
    { $unwind: "$householdMembers" },
    {
      $project: {        
        status: "$status",
        type: {
          $cond: {
            if: { $lt: ["$householdMembers.age", 18] },
            then: "Children",
            else: "Adult"
          }
        },
        age: "$householdMembers.age"
      }
    },
    {
      $group: { _id: { type: "$type", status: "$status" }, count: {$sum: 1} }
    }
  ]).exec(function(err, collection) {
    res.send(collection);
  });
};

exports.getAggregateHouseholdTypes = function(req, res){
  Adoptee.aggregate({$match: {status:{$in: ['Not Matched', 'Matched']}, 'criteria.householdType': {$exists:true, $ne: ""}}},{$group : { _id: "$criteria.householdType", count: {$sum: 1 }}}).exec(function(err,collection){
        res.send(collection);
    });
};

exports.getAggregateAdoptedCounts = function(req, res){
  Adoptee.aggregate({$match: {status:{$in: ['Not Matched', 'Matched']}}},{$group : { _id: "$status", count: {$sum: 1 }}}).exec(function(err,collection){
        res.send(collection);
  });
};

 Adoptee.aggregate({$group : { _id: "$status", count: {$sum: 1 }}})
exports.getAdopteeDups = function(req, res){
  Adoptee.find({"status": "Possible Duplicate"}).exec(function(err,collection){
        res.send(collection);
  });
};

exports.updateAdoptee = function(req, res){
      var update = req.body,
          id = update._id,
          options = { upsert: true, new: true },
          userId = req.user ? req.user._id : null;     
      if(!id) {
          id = new mongoose.Types.ObjectId();
          update.createDate = new Date();
          update._createUser = userId;
      } else {
          delete update._id;
          delete update._createUser;
          update.modifyDate = new Date();
          update._modifyUser = userId;
      }

      delete update.__v;
      if (update._adopterId) {
          update._adopterId = update._adopterId.name ? update._adopterId._id : update._adopterId;
      }
      //duplicate checking...before updating this adoptee, check to see if there are any other adoptees in the system
      //having matching (name and ssn) or (matching address). If there are, both should be flagged as "Possible Duplicate"
      query = Adoptee.find({$and : [
                                    {_id: {$ne : id}},
                                    {$or : [ {$and : [{ssnLastFour:update.ssnLastFour, lastName: update.lastName, firstName: update.firstName}]},
                                             {"address.homeAddress": update.address.homeAddress}
                                           ]
                                    }
                                   ]
      });
      query.
          select("-image").
          exec(function(err, collection){
              if (collection && collection.length > 0){
                collection.forEach(function(item){
                  Adoptee.
                    update({_id: item._id}, {status : "Possible Duplicate", _modifyUser: userId, modifyDate : new Date()}, {}).
                    exec();
                });
                update.status = "Possible Duplicate";
              }
              Adoptee.
                findByIdAndUpdate(id, update, options).
                populate('_createUser', 'firstName lastName').
                populate('_modifyUser', 'firstName lastName').
                exec(function(err, adoptee) {
                  if(err) { res.status(400); return res.send({error:err.toString()});}
                  return res.send(adoptee);
                });
      });
};

exports.matchAdoptee = function(req, res){
    var update = req.body,
        id = update._id,
        userId = req.user ? req.user._id : null;
    delete update._id;
    delete update._createUser;
    update.modifyDate = new Date();
    update._modifyUser = userId;
    delete update.__v;
    if (update._adopterId) {
        update._adopterId = update._adopterId.name ? update._adopterId._id : update._adopterId;
    }
    Adoptee.findOne({_id: id}).
        select('-image').
        exec(function (err, adoptee) {
            if(err) { res.status(400); return res.send({error:err.toString()});}
            if (adoptee.status != "Not Matched") {
                res.send({error: "ERROR:  Adoptee status must be 'Not Matched'."});
            }else {
                Adoptee.
                    findByIdAndUpdate(id, update, {upsert: true, new: true}).
                    populate('_modifyUser', 'firstName lastName').
                    exec(function(err, adoptee) {
                        if(err) { res.status(400); return res.send({error:err.toString()});}
                        return res.send(adoptee);
                    });
            }
        });
};

exports.deleteAdoptee = function(req, res){
    Adoptee.findOne({_id : req.params.id}).
        select('-image').
        exec(function(err, adoptee){
            if(err) { res.status(400); return res.send({error:err.toString()});}
            if (adoptee._adopterId){
                return res.send({error: "Adoptee cannot be deleted while matched with an adopter."})
            }else {
                Adoptee.
                    findByIdAndRemove(req.params.id).
                    exec(function (err, adoptee) {
                        if (err) {
                            res.status(400);
                            return res.send({error: err.toString()});
                        }
                        return res.send(adoptee);
                    });
            }
    })

};

exports.getEnums = function(req, res) {
    res.send(Adoptee.getEnumValues());
};

exports.print = function(req, res) {

    fs.readFile('server/views/adopteePrint.jade', 'utf8', function (err, templateData) {
        Adoptee.findOne({_id: req.params.id}).
            populate('_adopterId').
            exec(function (err, adoptee) {
                adoptee.adopter = adoptee._adopterId;
                var html = htmlUtil.getAdopteeHtml(adoptee, templateData);
                res.status(200);
                res.send(html);
            });
    });
};

exports.getForm = function(req, res) {
    Adoptee.findOne({_id: req.params.id})
     .exec(function(err, adoptee){
       if (adoptee.image)
       {
         var decodedImage = new Buffer(adoptee.image, 'base64');
         res.writeHead(200, {'content-type' : 'image/tiff', 'content-disposition': 'attachment; filename=' + adoptee.lastName + adoptee._id + '.tif'});
         res.write(decodedImage);
       }
       else{
         res.write("<h1>No Image Found</h1>");
       }
       res.end();
     });
};


