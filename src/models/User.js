// // models/User.js
// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now },
//   rating: { type: Number, default: 0 },
//   ratingCount: { type: Number, default: 0 },
//   scamReports: { type: Number, default: 0 }
// });

// module.exports = mongoose.model('User', UserSchema);

// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  scamReports: { type: Number, default: 0 },
  paystackRecipientCode: { type: String }, // Store this after seller onboarding
});

module.exports = mongoose.model('User', UserSchema);