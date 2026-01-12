const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventSnapshot: {
    title: String,
    category: String,
    date: Date,
    price: Number
  },
  userSnapshot: {
    name: String,
    email: String
  },
  paymentMethod: {
    type: String,
    enum: ['khalti', 'esewa', 'free', 'none', 'pending'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },
  paymentReference: {
    type: String,
    default: ''
  },
  transactionId: {
    type: String,
    default: ''
  },
  recordedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

bookingSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
