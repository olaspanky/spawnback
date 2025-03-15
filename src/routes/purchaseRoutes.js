// routes/purchaseRoutes.js
const express = require('express');
const {
  createOrder,
  getUserPurchases,
  getUserSales,
  verifyPayment,
  getOrderById, // Imported correctly
} = require('../controllers/purchaseController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Routes
router.post('/', authMiddleware, createOrder);              // POST /api/purchases - Create an order
router.get('/purchases', authMiddleware, getUserPurchases); // GET /api/purchases/purchases - Get user's purchases
router.get('/sales', authMiddleware, getUserSales);         // GET /api/purchases/sales - Get user's sales
router.post('/verify-payment', authMiddleware, verifyPayment); // POST /api/purchases/verify-payment - Verify payment
router.get('/:orderId', authMiddleware, getOrderById);      // GET /api/purchases/:orderId - Get order by ID

module.exports = router;