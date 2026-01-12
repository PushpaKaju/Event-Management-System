const sendEmail = require("../utils/sendemail");
const express = require('express');
const Event = require('../models/Event');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { auth, isOrganizer } = require('../middleware/auth');

const router = express.Router();

// Get all events (public)
router.get('/', async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let query = { isPublic: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ date: 1 });

    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email phone')
      .populate('attendees.user', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ event });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
});

// Create event (requires auth + organizer)
router.post('/', auth, async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      organizer: req.userId
    };

    const event = new Event(eventData);
    await event.save();

    // Add to user's created events
    await User.findByIdAndUpdate(req.userId, {
      $push: { createdEvents: event._id }
    });

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

// Update event
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
});

// Register for event
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already registered
    const alreadyRegistered = event.attendees.some(
      attendee => attendee.user.toString() === req.userId
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check capacity
    if (event.attendees.length >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    const { payment } = req.body;
    const paymentMeta = payment || {};
    const requiresPayment = event.price > 0;
    event.attendees.push({
      user: req.userId,
      paymentMethod: paymentMeta.method || (requiresPayment ? 'none' : 'free'),
      paymentReference: paymentMeta.reference || '',
      paymentStatus: paymentMeta.status || (requiresPayment ? 'pending' : 'paid')
    });
    await event.save();

    // Add to user's registered events
    await User.findByIdAndUpdate(req.userId, {
      $push: { registeredEvents: event._id }
    });

    const user = await User.findById(req.userId).select('name email');
    const bookingPayload = {
      event: event._id,
      user: req.userId,
      eventSnapshot: {
        title: event.title,
        category: event.category,
        date: event.date,
        price: event.price
      },
      userSnapshot: {
        name: user?.name,
        email: user?.email
      },
      paymentMethod: paymentMeta.method || (requiresPayment ? 'none' : 'free'),
      paymentStatus: paymentMeta.status || (requiresPayment ? 'pending' : 'paid'),
      paymentReference: paymentMeta.reference || '',
      transactionId: paymentMeta.transactionId || paymentMeta.reference || ''
    };

    console.log('Registering booking', {
      event: event._id.toString(),
      user: req.userId,
      amount: bookingPayload.eventSnapshot.price,
      paymentMethod: bookingPayload.paymentMethod,
      transactionId: bookingPayload.transactionId
    });
    await Booking.findOneAndUpdate(
      { event: event._id, user: req.userId },
      bookingPayload,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('Booking upsert completed', { eventId: event._id.toString(), userId: req.userId });
    console.log("HELLO WORLD EVENT REGISTERED SUCCESSFULLY BROTHER");
    // Send confirmation email
await sendEmail({
  to: user.email,
  subject: "Event Registration Confirmation 🎉",
  html: `
    <h2>Registration Successful!</h2>
    <p>Hello <b>${user.name}</b>,</p>
    <p>You have successfully registered for the event:</p>

    <ul>
      <li><b>Event:</b> ${event.title}</li>
      <li><b>Date:</b> ${new Date(event.date).toDateString()}</li>
      <li><b>Category:</b> ${event.category}</li>
      <li><b>Price:</b> ${event.price === 0 ? "Free" : `₹${event.price}`}</li>
    </ul>

    <p>We look forward to seeing you there! 🚀</p>
    <p><b>Team Event Management</b></p>
  `
});

    res.json({ message: 'Successfully registered for event' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering for event', error: error.message });
  }
});

// Cancel registration
router.delete('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    event.attendees = event.attendees.filter(
      attendee => attendee.user.toString() !== req.userId
    );
    await event.save();

    // Remove from user's registered events
    await User.findByIdAndUpdate(req.userId, {
      $pull: { registeredEvents: event._id }
    });

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling registration', error: error.message });
  }
});

// Get user's created events
router.get('/user/created', auth, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.userId })
      .sort({ date: -1 });

    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// Get user's registered events
router.get('/user/registered', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: 'registeredEvents',
      populate: { path: 'organizer', select: 'name email' }
    });

    res.json({ events: user.registeredEvents });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

module.exports = router;
