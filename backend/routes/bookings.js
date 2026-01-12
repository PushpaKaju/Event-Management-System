const express = require('express');
const { auth } = require('../middleware/auth');
const Booking = require('../models/Booking');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const { eventId } = req.query;
  if (!eventId) {
    return res.status(400).json({ message: 'eventId query parameter is required' });
  }

  try {
    const booking = await Booking.findOne({ event: eventId, user: req.userId }).lean();
    res.json({ booking });
  } catch (error) {
    console.error('Unable to fetch booking', error);
    res.status(500).json({ message: 'Unable to fetch booking details', error: error.message });
  }
});

module.exports = router;
