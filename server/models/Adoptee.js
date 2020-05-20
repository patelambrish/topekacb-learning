var mongoose = require("mongoose"),
  Chance = require("chance");

var phone = {
  name: { type: String },
  number: { type: String }
};

var site = {
  value: { type: String },
  name: { type: String }
};

var languages = ["Spanish", "Spanish/English spoken by"];

//var sites = ['D', 'L', 'A', 'O'];
var sites = [
  "Echo Ridge",
  "Pine Ridge",
  "State Street",
  "Jackson Towers",
  "Polk Towers",
  "Tenn Town I",
  "Tenn Town II",
  "Tyler Towers",
  "TRM",
  "Other"
];

var clothingSizeTypes = ["A", "J", "C"];
var shoeSizeTypes = ["A", "C"];

var householdMember = {
  name: { type: String },
  ssnLastFour: { type: String, max: "9999" },
  age: { type: Number, max: 99 },
  gender: { type: String, enum: genders },
  pantSizeType: { type: String, enum: clothingSizeTypes },
  pantSize: { type: String },
  shirtSizeType: { type: String, enum: clothingSizeTypes },
  shirtSize: { type: String },
  shoeSizeType: { type: String, enum: shoeSizeTypes },
  shoeSize: { type: String },
  wishList: { type: String }
};

var householdTypes = [
  "Couple w/children",
  "Single Parent w/children",
  "Grandparents w/children",
  "Multiple Adults (no children)",
  "Single Person"
];
var states = ["KS"];

var adopteeStates = [
  "In Process",
  "Not Matched",
  "Matched",
  "Possible Duplicate",
  "Pulled For View/Update"
];
var genders = ["Male", "Female"];
var specialNeedsEnum = ["Senior (60+)", "Veteran", "Disabled", "Homebound", "Pet - Dog", "Pet - Cat"];
var membersEnum = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20'];

var adopteeSchema = mongoose.Schema({
  firstName: { type: String, required: "{PATH} is required!" },
  lastName: { type: String, required: "{PATH} is required!" },
  middleInitial: { type: String },
  birthDate: { type: Date },
  ssnLastFour: { type: String, max: "9999" },
  gender: { type: String, enum: genders },
  intakeDate: { type: Date },
  agent: {
    agency: { type: String },
    agentName: { type: String },
    agentPhone: { type: String }
  },
  _adopterId: { type: mongoose.Schema.Types.ObjectId, ref: "Adopter" },
  address: {
    homeAddress: { type: String, required: "{PATH} is required!" },
    city: { type: String },
    state: { type: String, enum: states },
    zip: { type: String }
  },
  homePhone: { type: phone },
  cell1Phone: { type: phone },
  cell2Phone: { type: phone },
  otherPhone: { type: phone },
  email: { type: String },
  fax: { type: String },
  status: { type: String, enum: adopteeStates },
  language: { type: String, enum: languages },
  englishSpeaker: { type: String },
  criteria: {
    story: { type: String },
    volunteerComment: { type: String },
    internalComment: { type: String },
    specialNeeds: [{ type: String, enum: specialNeedsEnum }],
    householdType: { type: String, enum: householdTypes }
  },
  isDiabetic: { type: Boolean },
  isAllergic: { type: Boolean },
  reactionFoods: { type: String },
  isOkToText: { type: Boolean },
  isPetOwner: { type: Boolean },
  petTypes: { type: String },
  householdMembers: [householdMember],
  applicationNumber: { type: Number, index: { unique: true, dropDups: true } },
  site: { type: String, enum: sites },
  image: { type: String },
  createDate: { type: Date },
  _createUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  modifyDate: { type: Date },
  _modifyUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});
adopteeSchema.static("getEnumValues", function() {
  return {
    household: householdTypes,
    language: languages,
    gender: genders,
    clothingSizeType: clothingSizeTypes,
    shoeSizeType: shoeSizeTypes,
    special: specialNeedsEnum,
    status: adopteeStates,
    site: sites,
    members: membersEnum
  };
});
var Adoptee = mongoose.model("Adoptee", adopteeSchema);

function createSampleAdoptees() {
  var Adoptee = mongoose.model("Adoptee");

  return Adoptee.count()
    .exec()
    .then(function(count) {
      if (count === 0) {
        return generateAdoptees(4000);
      } else {
        throw new Error("db already has " + count + " adoptees.");
      }
    });
}

function getAggregateHouseHolds() {
  var Adoptee = mongoose.model("Adoptee");
}

function generateAdoptees(count) {
  var User = mongoose.model("User"),
    Adoptee = mongoose.model("Adoptee"),
    promise;

  console.log("generating sample adoptees...");

  return User.find({})
    .select("_id")
    .exec()
    .then(function(userPool) {
      var chance = new Chance(),
        data = [],
        adoptee,
        gender,
        hispanic,
        language,
        allergic,
        site,
        petOwner,
        allergens = [
          "Peanut",
          "Tree nuts",
          "Milk",
          "Egg",
          "Wheat",
          "Soy",
          "Fish",
          "Shellfish"
        ],
        domesticAnimals = ["Dog", "Cat", "Gerbil", "Parakeet"],
        i = 1;

      chance.mixin({
        contact: function() {
          return {
            name: chance.first(),
            number: chance.phone()
          };
        },
        child: function() {
          var age = chance.age({
            type: chance.pick(
              ["child", "teen", "adult", "senior"],
              [8, 8, 2, 1]
            )
          });

          return {
            name: chance.first(),
            ssnLastFour: chance.ssn({ ssnFour: true }),
            age: age,
            gender: chance.gender(),
            pantSizeType: chance.pick(clothingSizeTypes, 1),
            pantSize: chance.integer({ min: 7, max: 20 }),
            shirtSizeType: chance.pick(clothingSizeTypes, 1),
            shirtSize: chance.integer({ min: 7, max: 20 }),
            shoeSizeType: chance.pick(shoeSizeTypes, 1),
            shoeSize: chance.integer({ min: 0, max: 7 }),
            wishList:
              age < 18
                ? chance
                    .pick(
                      [
                        "Lego Duplo",
                        "Fur Real",
                        "Elmo",
                        "Elsa Doll",
                        "Easy-Bake",
                        "Transformer",
                        "Simon",
                        "Scooter",
                        "R/C Crawler",
                        "Red Rider BB"
                      ],
                      3
                    )
                    .join(", ")
                : null
          };
        }
      });

      /**
     * generate random sample of special needs. may return 0 - 4 unique special needs.
     * the likelihood of having a particular special need is based on US census stats.
     * the likelihood of having multiple special needs is totally arbitrary.
     * US Census stats (% of total population):
     *   20% Senior 60+, 8% Veterans, 4% Disabled, 1% Homebound
    */
      function sampleSpecialNeeds() {
        var specPct = [20, 8, 4, 1],
          combPct = [100, 50, 20, 10],
          needs = [],
          i,
          n,
          item;

        for (i = 0, n = 0; (item = specialNeedsEnum[i]); i++) {
          if (
            chance.bool({ likelihood: specPct[i] }) &&
            chance.bool({ likelihood: combPct[n] })
          ) {
            n = needs.push(item);
          }
        }

        return needs;
      }

      for (; i <= count; i++) {
        if (i % 500 === 0) {
          process.stdout.write(
            chance.pad(i, 4) + " adoptees generated.\033[0G"
          );
        }

        gender = chance.gender();
        hispanic = chance.bool({ likelihood: 17 });
        language = chance.pick(languages, 1);
        allergic = chance.bool({ likelihood: 30 });
        petOwner = chance.bool({ likelihood: 48 });
        site = chance.pick(sites, 1);

        adoptee = new Adoptee({
          firstName: chance.first({ gender: gender }),
          middleInitial: chance.character({ alpha: true, casing: "upper" }),
          lastName: chance.last(),
          birthDate: chance.birthday(),
          ssnLastFour: chance.ssn({ ssnFour: true }),
          gender: gender,
          agent:
            (chance.bool() && {
              agency: chance.capitalize(chance.word()),
              agentName: chance.name(),
              agentPhone: chance.phone()
            }) ||
            undefined,
          address: {
            homeAddress: chance.address({ short_suffix: true }),
            city: "Topeka",
            state: "KS",
            zip: chance.integer({ min: 66601, max: 66667 })
          },
          homePhone: chance.contact(),
          cell1Phone:
            (chance.bool({ likelihood: 70 }) && chance.contact()) || undefined,
          cell2Phone:
            (chance.bool({ likelihood: 60 }) && chance.contact()) || undefined,
          otherPhone:
            (chance.bool({ likelihood: 40 }) && chance.contact()) || undefined,
          email: chance.email(),
          fax: (chance.bool({ likelihood: 10 }) && chance.phone()) || undefined,
          status:
            (chance.bool({ likelihood: 88 }) && "Not Matched") || "In Process",
          language: (hispanic && language) || undefined,
          englishSpeaker:
            (language === languages[1] && chance.first()) || undefined,
          isDiabetic: chance.bool({ likelihood: 10 }),
          isPetOwner: chance.bool({ likelihood: 40 }),
          petTypes:
            (petOwner &&
              []
                .concat(chance.pick(domesticAnimals, chance.d4()))
                .join(", ")) ||
            undefined,
          isAllergic: allergic,
          reactionFoods:
            (allergic &&
              [].concat(chance.pick(allergens, chance.d4())).join(", ")) ||
            undefined,
          criteria: {
            story: chance.paragraph(),
            volunteerComment:
              (chance.bool() && chance.sentence(2)) || undefined,
            internalComment: (chance.bool() && chance.sentence()) || undefined,
            householdType: chance.pick(householdTypes, 1),
            specialNeeds: sampleSpecialNeeds()
          },
          householdMembers: chance.n(chance.child, chance.d4()),
          applicationNumber: i,
          site: site,
          createDate: chance.date({ month: 8, year: 2014 }),
          _createUser: chance.pick(userPool),
          modifyDate: chance.date({ month: 10, year: 2014 }),
          _modifyUser: chance.pick(userPool)
        });

        data.push(adoptee);
      }

      process.stdout.write("\n");
      console.log("Saving sample adoptees...");

      promise = Adoptee.create(data).then(function() {
        console.log(
          "Successfully created " + data.length + " sample adoptees."
        );
        return data;
      });

      return promise;
    });
}

function startOrphanedUpdateChecking() {
  setInterval(function() {
    var thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(
      thirtyMinutesAgo.getMinutes() - 30,
      thirtyMinutesAgo.getSeconds(),
      0
    );
    console.log(
      'Updating status on adoptees from "Pulled For View/Update" to "In Process" modified earlier than ' +
        thirtyMinutesAgo
    );
    Adoptee.find({
      status: "Pulled For View/Update",
      modifyDate: { $lt: thirtyMinutesAgo }
    }).exec(function(err, collection) {
      if (err) {
        console.log(err);
      } else {
        collection.forEach(function(a) {
          console.log("Updating status for " + a.firstName + " " + a.lastName);
          Adoptee.update({ _id: a._id }, { status: "In Process" }, {}).exec();
        });
      }
    });
  }, 300000); //every five minutes
}

exports.createSampleAdoptees = createSampleAdoptees;
exports.startOrphanedUpdateChecking = startOrphanedUpdateChecking;
