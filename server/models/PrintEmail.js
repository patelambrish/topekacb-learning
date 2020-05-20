var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    statusEnum = ['Not Complete', 'Complete'],
    jobType = ['Print', 'Email'];

var printEmailSchema = new Schema({
  adopter: { type: Schema.Types.ObjectId, ref: 'Adopter' },
  html: { type: String },
  status: { type: String, enum: statusEnum, required: '{PATH} is required!'},
  jobType: { type: String, enum: jobType },
  emailTo: [{ type: String }],
  createDate: Date,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User'},
  updateDate: Date,
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User'}
});

mongoose.model('PrintEmail', printEmailSchema);