// routes/itemRoutes.js
const express = require('express');
const { createItem, getItems, getItem } = require('../controllers/itemController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/items', authMiddleware, createItem);
router.get('/items', getItems);
router.get('/items/:id', getItem);

module.exports = router;