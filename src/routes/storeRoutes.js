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
  confirmPayment,
  getAllPurchases,
  getUserPurchases,
  updatePurchaseStatus,
  CATEGORIES,
} = require('../controllers/goodController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Payment and purchase routes (specific routes first)
router.post('/confirm-payment', authMiddleware, confirmPayment);
router.get('/purchases/all', authMiddleware, getAllPurchases);
router.get('/purchases', authMiddleware, getUserPurchases); // Moved before /:goodId
router.put('/purchases/:purchaseId/status', authMiddleware, updatePurchaseStatus);

// Goods Routes (admin only for create, update, delete)
router.post('/goods', authMiddleware, createGood);
router.put('/:goodId', authMiddleware, updateGood);
router.delete('/:goodId', authMiddleware, deleteGood);
router.put('/:goodId/availability', authMiddleware, toggleAvailability);

// Public routes
router.get('/goods', getAllGoods);
router.get('/categories', (req, res) => res.json(CATEGORIES));
router.get('/category/:category', getGoodsByCategory);
router.get('/stats', getCategoryStats);
router.get('/:goodId', getGood); // Dynamic route last

module.exports = router;