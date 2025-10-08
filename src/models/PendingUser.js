//for otp 
const mongoose = require("mongoose");

const pendingSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  code: String,
  expires: Number,
});

module.exports = mongoose.models.PendingUser || mongoose.model('PendingUser', pendingSchema);
