// 

// routes/purchaseRoutes.js
const express = require('express');
const {
  createOrder,
  getUserPurchases,
  getUserSales,
  verifyPayment,
  getOrderById,
  releaseFunds,
  retractFunds,
  rateSeller,
  scheduleMeeting
} = require('../controllers/purchaseController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Routes
router.post('/', authMiddleware, createOrder);              // POST /api/purchases - Create an order
router.get('/purchases', authMiddleware, getUserPurchases); // GET /api/purchases/purchases - Get user's purchases
router.get('/sales', authMiddleware, getUserSales);         // GET /api/purchases/sales - Get user's sales
router.post('/verify-payment', authMiddleware, verifyPayment); // POST /api/purchases/verify-payment - Verify payment
router.get('/:orderId', authMiddleware, getOrderById);      // GET /api/purchases/:orderId - Get order by ID
router.post('/:orderId/release-funds', authMiddleware, releaseFunds); // POST /api/purchases/:orderId/release-funds - Release funds to seller
router.post('/:orderId/retract-funds', authMiddleware, retractFunds); // POST /api/purchases/:orderId/retract-funds - Request refund
router.post('/:orderId/rate-seller', authMiddleware, rateSeller);     // POST /api/purchases/:orderId/rate-seller - Rate the seller
router.post('/:orderId/schedule-meeting', authMiddleware, scheduleMeeting);



module.exports = router;