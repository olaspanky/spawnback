const express = require('express');
const {
  createItem,
  getItems,
  getItem,
  updateItem,
  deleteItem,
  getItemsByUser // Add this line
} = require('../controllers/itemController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Create a new item
router.post('/items', authMiddleware, createItem);

// Get all items
router.get('/items', getItems);

// Get a single item by ID
router.get('/items/:id', getItem);

// Get items by user ID (seller)
router.get('/items/user/:userId', authMiddleware, getItemsByUser); // Add this line

// Update an item by ID
router.put('/items/:id', authMiddleware, updateItem);

// Delete an item by ID
router.delete('/items/:id', authMiddleware, deleteItem);

module.exports = router;
