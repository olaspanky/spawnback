// routes/userRoutes.js
const express = require('express');
const { signup, login, verifyOTP, resendOTP, googleSignup } = require('../controllers/userController');
const router = express.Router();

router.post('/signup', signup);         // Regular signup with OTP
router.post('/login', login);           // Login
router.post('/verify-otp', verifyOTP);  // OTP verification
router.post('/resend-otp', resendOTP);  // OTP verification
router.post('/google-signup', googleSignup); // Google OAuth signup

module.exports = router;