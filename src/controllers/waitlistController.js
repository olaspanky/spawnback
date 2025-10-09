// // controllers/waitlistController.js
// const Waitlist = require('../models/waitlistModel');

// exports.submitWaitlist = async (req, res) => {
//   try {
//     const { name, email, phone, location } = req.body;

//     // Validate input
//     if (!name || !email || !phone || !location) {
//       return res.status(400).json({ message: 'All fields are required' });
//     }

//     // Check if email already exists
//     const existingEntry = await Waitlist.findOne({ email });
//     if (existingEntry) {
//       return res.status(400).json({ message: 'Email already registered' });
//     }

//     // Create new waitlist entry
//     const waitlistEntry = new Waitlist({
//       name,
//       email,
//       phone,
//       location,
//     });

//     // Save to database
//     await waitlistEntry.save();

//     res.status(201).json({ message: 'Successfully joined waitlist' });
//   } catch (error) {
//     console.error('Error submitting waitlist:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// controllers/waitlistController.js
const Waitlist = require('../models/waitlistModel');
const asyncHandler = require('express-async-handler');

// @desc    Submit waitlist entry
// @route   POST /api/waitlist
// @access  Public
exports.submitWaitlist = async (req, res) => {
  try {
    const { name, email, phone, location } = req.body;

    // Validate input
    if (!name || !email || !phone || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email already exists
    const existingEntry = await Waitlist.findOne({ email });
    if (existingEntry) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new waitlist entry
    const waitlistEntry = new Waitlist({
      name,
      email,
      phone,
      location,
    });

    // Save to database
    await waitlistEntry.save();

    res.status(201).json({ message: 'Successfully joined waitlist' });
  } catch (error) {
    console.error('Error submitting waitlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all waitlist entries
// @route   GET /api/waitlist
// @access  Private (Admin)
exports.getAllWaitlistEntries = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error('Admin access required');
  }
  const waitlistEntries = await Waitlist.find();
  res.json({ success: true, data: waitlistEntries });
});