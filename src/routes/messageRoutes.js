// routes/messageRoutes.js
const express = require('express');
const { saveMessage, getMessages, getChatRooms } = require('../controllers/messageController');
const router = express.Router();

router.post('/messages', saveMessage);
router.get('/messages/:room', getMessages);
router.get('/chat-rooms/:userId', getChatRooms);

module.exports = router;