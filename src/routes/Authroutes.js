const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, getMe } = require('../controllers/AuthController');
const { protect } = require('../middlewares/AuthMiddleware');

router.post('/register', registerAdmin); // lock this down after first use
router.post('/login',    loginAdmin);
router.get('/me',        protect, getMe);

module.exports = router;