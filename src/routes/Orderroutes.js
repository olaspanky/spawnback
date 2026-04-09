const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/auth'); // your existing auth middleware
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/Ordercontroller');

// Public — customer submits the OrderForm
router.post('/', createOrder);

// Admin — retrieve orders (supports ?status= and ?service= filters)
router.get('/', protect, adminOnly, getAllOrders);

// Admin — retrieve a single order
router.get('/:id', protect, adminOnly, getOrderById);

// Admin — advance order status
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;