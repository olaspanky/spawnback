const express = require('express');
const router = express.Router();
const {
  createShoppingList,
  getAllShoppingLists,
  updateShoppingListStatus,
} = require('../controllers/uploadListController');
const authMiddleware = require('../middlewares/authMiddleware');

// Create shopping list with file metadata (public)
router.post('/', createShoppingList);

// Get all shopping lists (admin only)
router.get('/', authMiddleware, getAllShoppingLists);

// Update shopping list status (admin only)
router.put('/:id', authMiddleware, updateShoppingListStatus);

module.exports = router;