const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required']
  },
  category: {
    type: String,
    enum: [
      'conference',
      'workshop',
      'seminar',
      'meetup',
      'webinar',
      'wedding',
      'birthday-party',
      'corporate-event',
      'networking',
      'charity',
      'fundraiser',
      'concert',
      'festival',
      'exhibition',
      'sports',
      'hackathon',
      'college-program',
      'graduation',
      'reunion',
      'product-launch',
      'training',
      'awards-ceremony',
      'community',
      'cultural',
      'religious',
      'other'
    ],
    default: 'other'
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },
  location: {
    venue: {
      type: String,
      required: [true, 'Venue is required']
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: String,
    state: String,
    zipCode: String
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  capacity: {
    type: Number,
    required: [true, 'Event capacity is required'],
    min: 1
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  image: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled'],
      default: 'registered'
    },
    paymentMethod: {
      type: String,
      enum: ['khalti', 'esewa', 'free', 'none'],
      default: 'none'
    },
    paymentReference: {
      type: String,
      default: ''
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'pending'
    }
  }],
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for searching
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Event', eventSchema);
