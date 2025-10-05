const express = require('express');
const {
  createGood,
  updateGood,
  deleteGood,
  getAllGoods,
  getGoodsByCategory,
  getGood,
  toggleAvailability,
  getCategoryStats,
  CATEGORIES
} = require('../controllers/goodController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Goods Routes (admin only for create, update, delete)
router.post('/goods', authMiddleware, createGood);
router.put('/goods/:goodId', authMiddleware, updateGood);
router.delete('/goods/:goodId', authMiddleware, deleteGood);
router.put('/:goodId/availability', authMiddleware, toggleAvailability);

// Public routes
router.get('/goods', getAllGoods);
router.get('/categories', (req, res) => res.json(CATEGORIES)); // Get available categories
router.get('/category/:category', getGoodsByCategory);
router.get('/stats', getCategoryStats);
router.get('/:goodId', getGood);

module.exports = router;