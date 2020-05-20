var mongoose = require('mongoose'),
    Chance = require('chance'),
    Schema = mongoose.Schema,
    entityEnum = ['Individual', 'Organization', 'Department'],
    stateEnum = ['KS', 'MO', 'NE', 'OK', 'CO'],
    phoneEnum = ['Home', 'Work', 'Mobile', 'Alternate', 'Fax'],
    statusEnum = ['In Process', 'Not Matched', 'Matched'],
    notifyEnum = ['Email', 'Fax', 'Pickup', 'Postal Mail'],
    householdEnum = [
      "Couple w/children",
      "Single Parent w/children",
      "Grandparents w/children",
      "Multiple Adults (no children)",
      "Single Person"
    ],
    genderEnum = ['Male', 'Female'],
    ageEnum = ['0 - 7', '8 - 12', '13 - 18'],
    specialEnum = ["Senior (60+)", "Veteran", "Disabled", "Homebound", "Pet - Dog", "Pet - Cat"],
    membersEnum = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20'],
    sizeEnum = ['NB', '3M', '6M', '12M', '18M', '24M', '2T', '3T', '4T', 'XS', 'S', 'M', 'L', 'XL'];

var phoneSchema = new Schema({
  name: { type: String, enum: phoneEnum, default: 'Home' },
  number: String,
  contact: String
});

var adopterSchema = new Schema({
  entity: { type: String, enum: entityEnum, default: 'Individual' },
  name: { type: String, required: '{PATH} is required!' },
  org: String,
  dept: String,
  address: {
    street: { type: String, required: '{PATH} is required!' },
    city: { type: String, default: 'Topeka' },
    state: { type: String, enum: stateEnum, default: 'KS' },
    zip: String
  },
  phones: [phoneSchema],
  email: String,
  email2: String,
  notifyMethods: [{ type: String, enum: notifyEnum }],
  criteria: {
    count: Number,
    memberCount: Number,
    households: [{ type: String, enum: householdEnum }],
    childAges: [{ type: String, enum: ageEnum }],
    special: [{ type: String, enum: specialEnum }],
    comment: String
  },
  adoptees: [{ type: Schema.Types.ObjectId, ref: 'Adoptee'}],
  status: { type: String, enum: statusEnum, default: 'In Process' },
  createDate: Date,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User'},
  updateDate: Date,
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User'}
});

adopterSchema.static('getEnumValues', function() {
  return {
    age: ageEnum,
    entity: entityEnum,
    gender: genderEnum,
    household: householdEnum,
    notify: notifyEnum,
    phone: phoneEnum,
    size: sizeEnum,
    special: specialEnum,
    state: stateEnum,
    status: statusEnum,
    members: membersEnum
  };
});

mongoose.model('Adopter', adopterSchema);

function createSampleAdopters() {
  var Adopter = mongoose.model('Adopter');

  return Adopter.count().exec().then(function(count) {
      if(count === 0) {
        return generateAdopters(1500);
      } else {
        throw new Error('db already has ' + count + ' adopters.');
      }
    });
}

function createSampleMatch(adopter, adopteePool) {
  var chance = new Chance(),
      Adoptee = mongoose.model('Adoptee'),
      Adopter = mongoose.model('Adopter'),
      householdCount = adopter.criteria.count,
      matchCount = chance.natural({min:0,max:householdCount}),
      matchedAdoptees, matchedAdopteeIds;
      
  if(matchCount > 0 && adopteePool.length > 0) {
    matchedAdoptees = adopteePool.splice(0, matchCount);
    matchedAdopteeIds = matchedAdoptees.map(function(a) { return a._id; });
    matchCount = matchedAdoptees.length; 
    
    matchedAdopteeIds.forEach(function(id) {
      Adoptee.update({ _id: id }, {
        _adopterId: adopter._id,
        status: 'Matched'
      }).exec();
    });
    
    Adopter.update({ _id: adopter._id }, {
      adoptees: matchedAdopteeIds,
      status: householdCount === matchCount ? 'Matched' : 'Not Matched'
    }).exec();

    process.stdout.write('Adopter ' + adopter._id + ' matched with ' + chance.pad(matchCount,3) + ' out of ' + chance.pad(householdCount,3) + ' adoptees\033[0G');
  }
}

function generateAdopters(count) {
  var User = mongoose.model('User'),
      Adopter = mongoose.model('Adopter'),
      promise;

  console.log('generating sample adopters...');

  return User.find({}).select('_id').exec().then(function(userPool) {
    var chance = new Chance(),
        data = [], adopter, entity, householdCount, 
        i = 1;

    for(; i <= count; i++) {
      if(i % 500 === 0) {
        process.stdout.write(chance.pad(i,4) + ' adopters generated.\033[0G');
      }

      // pick entity (individual, dept, org) with the greater proportion to individuals
      entity = chance.weighted(entityEnum,[20, 2, 1]);
      // pick household count based on entity, eg org can adopt as many as 200 familes 
      householdCount = 
        (entity === 'Individual' && chance.d4()) || 
        (entity === 'Department' && chance.d20()) || 
        (entity === 'Organization' && chance.d100()*2); 

      adopter = new Adopter({
        entity: entity,
        name: chance.name(),
        org: (entity !== 'Individual' ? chance.capitalize(chance.word()) : null),
        dept: (entity === 'Deptartment' ? chance.capitalize(chance.word()) : null),
        address: {
          street: chance.address({short_suffix: true}),
          city: chance.city(),
          state: chance.pick(stateEnum),
          zip: chance.zip()
        },
        phones: [{
          name: chance.weighted(phoneEnum, [4, 4, 4, 2, 1]),
          number: chance.phone(),
          contact: chance.first()
        }, {
          name: chance.weighted(phoneEnum, [4, 4, 4, 2, 1]),
          number: chance.phone()
        }],
        email: chance.email(),
        notifyMethods: chance.pick(notifyEnum, 1),
        criteria: {
          count: householdCount,
          memberCount: chance.d4(),
          households: chance.unique(chance.pick, chance.d4(), householdEnum, 1),
          childAges: chance.pick(ageEnum, 1),
          special: chance.unique(chance.pick, chance.d4(), specialEnum, 1),
          comment: chance.sentence()
        },
        adoptees: [],
        status: 'In Process',
        createDate: chance.date({month: 8, year: 2014}),
        createdBy: chance.pick(userPool),
        updateDate: chance.date({month: 10, year: 2014}),
        updatedBy: chance.pick(userPool)
      });
      
      data.push(adopter);
    }

    process.stdout.write('\n');
    console.log('Saving sample adopters...');
    
    promise = Adopter.create(data).then(function() {
      console.log('Successfully created ' + data.length + ' sample adopters.');
      return data;
    });
    
    return promise;
  });
}

exports.createSampleAdopters = createSampleAdopters;
exports.createSampleMatch = createSampleMatch;