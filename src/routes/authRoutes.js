// routes/authRoutes.js
const express = require('express');
const { authTest } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/auth-test', authMiddleware, authTest);

module.exports = router;