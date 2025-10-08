const mongoose = require('mongoose');

const userTicketsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  tickets: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.UserTickets || mongoose.model('UserTickets', userTicketsSchema); 
