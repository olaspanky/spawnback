// routes/waitlistRoutes.js
const express = require('express');
const router = express.Router();
const waitlistController = require('../controllers/waitlistController');

router.post('/waitlist', waitlistController.submitWaitlist);

module.exports = router;