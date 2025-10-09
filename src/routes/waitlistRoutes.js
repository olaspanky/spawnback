// routes/waitlistRoutes.js
const express = require('express');
const router = express.Router();
const waitlistController = require('../controllers/waitlistController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/waitlist', waitlistController.submitWaitlist);
router.get('/waitlist', authMiddleware, waitlistController.getAllWaitlistEntries);

module.exports = router;