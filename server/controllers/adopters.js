var mongoose = require('mongoose'),
    Adopter = mongoose.model('Adopter'),
    Adoptee = mongoose.model('Adoptee'),
    fs = require('fs'),
    htmlUtil = require('../utilities/adopteeHtml');

function getAdopterHtml(adopter, templateData) {
  var completeHtml = '',
  		html;

  if(adopter.adoptees && adopter.adoptees.length > 0) {
    adopter.adoptees.forEach(function(adoptee) {
      adoptee.adopter = {
        name: adopter.name,
        email: adopter.email,
        address: adopter.address,
        phones: adopter.phones,
        notifyMethods: adopter.notifyMethods
      };

      html = htmlUtil.getAdopteeHtml(adoptee, templateData);
      completeHtml = completeHtml + html;
    });
  }

  return completeHtml;
}

exports.getAdopters = function(req, res, next) {
  var searchFilters, nameFilter, entityFilter, householdFilter, specialFilter, statusFilter, membersFilter,
      sort =  req.query.sort,
      start = parseInt(req.query.start, 10) || 0,
      limit = parseInt(req.query.limit, 10) || 0,
      query = Adopter.find();
  
  if(req.query.filter) {
    searchFilters = JSON.parse(req.query.filter);
    
    if(searchFilters) {
      nameFilter = searchFilters.name;
      entityFilter = searchFilters.entity;
      householdFilter = searchFilters.household;
      specialFilter = searchFilters.special;
      statusFilter = searchFilters.status;
      membersFilter = searchFilters.members;

      if(nameFilter) {
        query.or([
          {name: new RegExp(nameFilter, 'i')},
          {org: new RegExp(nameFilter, 'i')},
          {dept: new RegExp(nameFilter, 'i')}
        ]);
      }

      if(membersFilter) {
        if(membersFilter !== ">=12"){
           query = query.where('criteria.memberCount').equals(membersFilter);
        } else {
          query = query.where('criteria.memberCount').gte(12);
        }
      }

      if(entityFilter) {
        query = query.where('entity').equals(entityFilter);
      }

      if(householdFilter) {
        query = query.where('criteria.households').in([].concat(householdFilter));
      }

      if(specialFilter) {
        query = query.where('criteria.special').in([].concat(specialFilter));
      }

      if(statusFilter) {
        query = query.where('status').equals(statusFilter);
      }
    }
  }

  Adopter.count(query).exec().
  then(function(count) {
    if(sort) {
      query = query.sort(sort);
    }
  
    if(limit) {
      query = query.skip(start).limit(limit);
    }
    
    query.
    populate('createdBy', 'firstName lastName').
    populate('updatedBy', 'firstName lastName').
    select({
      entity: 1,
      name: 1,
      org: 1,
      dept: 1,
      address: 1,
      criteria: 1,
      status: 1,
      createDate: 1,
      createdBy: 1,
      updatedBy: 1
    }).
    exec(function(err, collection) {
      if(err) {
        return next(err);
      }
      res.send({
        data: collection,
        totalCount: count
      });
    });
  });
};

exports.getAdopterById = function(req, res, next) {
  Adopter.
  findById(req.params.id).
  populate('createdBy', 'firstName lastName').
  populate('updatedBy', 'firstName lastName').
  populate('adoptees').
  select('-__v').
  lean(true).
  exec(function(err, adopter) {
    if(err) {
      return next(err);
    }
    if(adopter) {
      adopter.enums = Adopter.getEnumValues();
      res.send(adopter);
    } else {
      res.status(404).send('Not Found');
    }
  });
};

exports.saveAdopter = function(req, res, next) {
  //console.log(req.body);
  var data = req.body,
    id = data._id,
    options = {
      upsert: true,
      new: true
    },
    userId = req.user ? req.user._id : null;

  delete data.enums;
  

  /* ensure adoptees are mapped to ids instead of objects
   * mongoose should handle this automatically via its internal type casting
   * but I must have done something wrong since that is not happening
   */
  if(Array.isArray(data.adoptees) && data.adoptees.length) {
    data.adoptees = data.adoptees.map(function(item) {
      return item._id || item;
    });
  }
  
  if(!id) {
    id = new mongoose.Types.ObjectId();
    data.createDate = new Date();
    data.createdBy = userId;
  } else {
    delete data.createDate;
    delete data.createdBy;
    delete data._id;
    data.updateDate = new Date();
    data.updatedBy = userId;
  }
  
  //console.log(id);

  Adopter.
  findByIdAndUpdate(id, data, options).
  populate('createdBy', 'firstName lastName').
  populate('updatedBy', 'firstName lastName').
  populate('adoptees').
  select('-__v').
  lean(true).
  exec(function(err, adopter) {
    //console.log(adopter);
    if(err) {
      return next(err);
    }
    if(adopter) {
      adopter.enums = Adopter.getEnumValues();
      res.send(adopter);
    } else {
      res.status(404).send('Not Found');
    }
  });
};

exports.deleteAdopter = function(req, res, next) {
  Adopter.
  findByIdAndRemove(req.params.id).
  exec(function(err, adopter) {
    if(err) {
      return next(err);
    }
    if(adopter) {
      res.status(200).send('OK');
    } else {
      res.status(404).send('Not Found');
    }
  });
};

exports.print = function(req, res, next) {
  fs.readFile('server/views/adopteePrint.jade', 'utf8', function(err, templateData) {
    if(err) {
      return next(err);
    }

    Adopter.
    findById(req.params.id).
    populate('adoptees').
    select('-__v').
    exec(function(err, adopter) {
      if(err) {
        return next(err);
      }
      if(adopter) {
        var completeHtml = getAdopterHtml(adopter, templateData);
        res.status(200); 
        res.send(completeHtml);
      } else {
        res.status(404).send('Not Found');
      }
    });
  });
};

exports.getEnums = function(req, res) {
  res.send(Adopter.getEnumValues());
};

exports.removeAdoptee = function(req, res, next) {
  var adopterId = req.params.id,
      adopteeId = req.params.adopteeId,
      userId = req.user ? req.user._id : null,
      update = {
        status: 'Not Matched',
        _adopterId: null,
        modifyDate: new Date(),
        _modifyUser: userId
      };
    
  Adoptee.findByIdAndUpdate(adopteeId, update).exec().
  then(function(adoptee) {
    return Adopter.findById(adopterId).exec();
  }).
  then(function(adopter) {
    var update = {
        adoptees: adopter.adoptees || [],
        status: adopter.status,
        updateDate: new Date(),
        updatedBy: userId
      },
      arr = update.adoptees,
      index = arr.indexOf(adopteeId);
    if(index !== -1) {
      arr.splice(index, 1);
    }
    if(arr.length === 0 || arr.length !== adopter.criteria.count) {
      update.status = 'Not Matched';
    }
    Adopter.
    findByIdAndUpdate(adopterId, update, {upsert: true, new: true}).
    populate('createdBy', 'firstName lastName').
    populate('updatedBy', 'firstName lastName').
    populate('adoptees').
    select('-__v').
    lean(true).
    exec(function(err, adopter) {
      if(err) {
        return next(err);
      }
      if(adopter) {
        adopter.enums = Adopter.getEnumValues();
        res.send(adopter);
      } else {
        res.status(404).send('Not Found');
      }
    });
  });
};