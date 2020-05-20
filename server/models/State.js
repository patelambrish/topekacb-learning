var mongoose = require('mongoose'),
    stateSchema = mongoose.Schema({
      name: {type: String},
      abbreviation: {type: String}
    }),
    state = mongoose.model('State', stateSchema);

function createStates() {
  state.find({}).exec(function(err, collection) {
    if(collection.length === 0) {
      state.create({ "name": "Alabama", "abbreviation": "AL" });
      state.create({ "name": "Alaska", "abbreviation": "AK" });
      state.create({ "name": "American Samoa", "abbreviation": "AS" });
      state.create({ "name": "Arizona", "abbreviation": "AZ" });
      state.create({ "name": "Arkansas", "abbreviation": "AR" });
      state.create({ "name": "California", "abbreviation": "CA" });
      state.create({ "name": "Colorado", "abbreviation": "CO" });
      state.create({ "name": "Connecticut", "abbreviation": "CT" });
      state.create({ "name": "Delaware", "abbreviation": "DE" });
      state.create({ "name": "District Of Columbia", "abbreviation": "DC" });
      state.create({ "name": "Federated States Of Micronesia", "abbreviation": "FM" });
      state.create({ "name": "Florida", "abbreviation": "FL" });
      state.create({ "name": "Georgia", "abbreviation": "GA" });
      state.create({ "name": "Guam", "abbreviation": "GU" });
      state.create({ "name": "Hawaii", "abbreviation": "HI" });
      state.create({ "name": "Idaho", "abbreviation": "ID" });
      state.create({ "name": "Illinois", "abbreviation": "IL" });
      state.create({ "name": "Indiana", "abbreviation": "IN" });
      state.create({ "name": "Iowa", "abbreviation": "IA" });
      state.create({ "name": "Kansas", "abbreviation": "KS" });
      state.create({ "name": "Kentucky", "abbreviation": "KY" });
      state.create({ "name": "Louisiana", "abbreviation": "LA" });
      state.create({ "name": "Maine", "abbreviation": "ME" });
      state.create({ "name": "Marshall Islands", "abbreviation": "MH" });
      state.create({ "name": "Maryland", "abbreviation": "MD" });
      state.create({ "name": "Massachusetts", "abbreviation": "MA" });
      state.create({ "name": "Michigan", "abbreviation": "MI" });
      state.create({ "name": "Minnesota", "abbreviation": "MN" });
      state.create({ "name": "Mississippi", "abbreviation": "MS" });
      state.create({ "name": "Missouri", "abbreviation": "MO" });
      state.create({ "name": "Montana", "abbreviation": "MT" });
      state.create({ "name": "Nebraska", "abbreviation": "NE" });
      state.create({ "name": "Nevada", "abbreviation": "NV" });
      state.create({ "name": "New Hampshire", "abbreviation": "NH" });
      state.create({ "name": "New Jersey", "abbreviation": "NJ" });
      state.create({ "name": "New Mexico", "abbreviation": "NM" });
      state.create({ "name": "New York", "abbreviation": "NY" });
      state.create({ "name": "North Carolina", "abbreviation": "NC" });
      state.create({ "name": "North Dakota", "abbreviation": "ND" });
      state.create({ "name": "Northern Mariana Islands", "abbreviation": "MP" });
      state.create({ "name": "Ohio", "abbreviation": "OH" });
      state.create({ "name": "Oklahoma", "abbreviation": "OK" });
      state.create({ "name": "Oregon", "abbreviation": "OR" });
      state.create({ "name": "Palau", "abbreviation": "PW" });
      state.create({ "name": "Pennsylvania", "abbreviation": "PA" });
      state.create({ "name": "Puerto Rico", "abbreviation": "PR" });
      state.create({ "name": "Rhode Island", "abbreviation": "RI" });
      state.create({ "name": "South Carolina", "abbreviation": "SC" });
      state.create({ "name": "South Dakota", "abbreviation": "SD" });
      state.create({ "name": "Tennessee", "abbreviation": "TN" });
      state.create({ "name": "Texas", "abbreviation": "TX" });
      state.create({ "name": "Utah", "abbreviation": "UT" });
      state.create({ "name": "Vermont", "abbreviation": "VT" });
      state.create({ "name": "Virgin Islands", "abbreviation": "VI" });
      state.create({ "name": "Virginia", "abbreviation": "VA" });
      state.create({ "name": "Washington", "abbreviation": "WA" });
      state.create({ "name": "West Virginia", "abbreviation": "WV" });
      state.create({ "name": "Wisconsin", "abbreviation": "WI" });
      state.create({ "name": "Wyoming", "abbreviation": "WY" });
    }
  });
}

exports.createStates = createStates;