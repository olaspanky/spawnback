const Order = require('../models/Order');
const Item = require('../models/Items'); // Fixed typo: Items -> Item
const User = require('../models/User');
const axios = require('axios');
const { sendBuyerFollowUpEmail, sendSellerNotificationEmail } = require('./emailController');

exports.createOrder = async (req) => {
  try {
    const { itemID, paymentReference, quantity = 1 } = req.body; // Default quantity to 1 if not provided
    const buyer = req.user.id;

    console.log("createOrder - itemID:", itemID, "buyer:", buyer, "quantity:", quantity);

    // Validate quantity
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error('Quantity must be a positive integer');
    }

    // Fetch item and check availability
    const item = await Item.findById(itemID);
    if (!item) {
      console.log("Item not found for itemID:", itemID);
      throw new Error('Item not found');
    }
    if (item.quantity < quantity) {
      console.log("Insufficient quantity for itemID:", itemID, "Requested:", quantity, "Available:", item.quantity);
      throw new Error('Insufficient item quantity');
    }

    console.log("Item found:", item);

    // Deduct quantity and update item status
    item.quantity -= quantity;
    item.status = item.quantity === 0 ? 'sold' : 'available'; // Set to 'sold' only if quantity is 0
    await item.save();

    // Create order
    const order = new Order({
      buyer,
      seller: item.seller,
      item: itemID,
      price: item.price,
      quantity, // Save the ordered quantity
      paymentReference,
      status: 'pending',
      trackingStatus: 'paid',
    });

    await order.save();

    return order;
  } catch (error) {
    console.error("createOrder Error:", error.message);
    throw error;
  }
};

// Standalone route handler for creating an order
exports.createOrderRoute = async (req, res) => {
  try {
    const order = await exports.createOrder(req);
    res.status(201).json(order);
  } catch (error) {
    res.status(error.message === 'Item not found' || error.message === 'Insufficient item quantity' ? 400 : 500).json({
      error: error.message,
    });
  }
};

exports.getUserPurchases = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate('item')
      .populate('seller', 'username verified rating ratingCount scamReports');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserSales = async (req, res) => {
  try {
    const sales = await Order.find({ seller: req.user.id })
      .populate('item')
      .populate('buyer', 'username');
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { reference, itemID, quantity } = req.body;

    console.log("verifyPayment - reference:", reference, "itemID:", itemID, "quantity:", quantity, "user:", req.user);

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Verify payment with Paystack
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    console.log("Full Response:", response.data);

    const paymentData = response.data.data;

    if (!paymentData || paymentData.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Payment not verified',
        details: response.data.message || 'Unknown error',
      });
    }

    // Create order
    const order = await exports.createOrder({
      body: { itemID, paymentReference: reference, quantity },
      user: { id: req.user.id },
    });

    // Fetch additional data for email notifications
    const buyer = await User.findById(order.buyer);
    const item = await Item.findById(order.item);
    const seller = await User.findById(order.seller);

    // Send emails after successful order creation
    try {
      await sendBuyerFollowUpEmail(buyer, order, item);
      await sendSellerNotificationEmail(seller, order, item, buyer);
    } catch (emailError) {
      console.error("Email Sending Error:", emailError.message);
    }

    res.json({
      success: true,
      order,
      redirectUrl: `/declutter/purchase/${order._id}`,
      message: 'Payment verified and order created successfully',
    });
  } catch (error) {
    console.error("Payment Verification Error:", error.response ? error.response.data : error.message);
    res.status(error.message === 'Item not found' || error.message === 'Insufficient item quantity' ? 400 : 500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('item')
      .populate('seller', 'username verified rating ratingCount scamReports');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user.id !== order.buyer.toString() && req.user.id !== order.seller.toString()) {
      return res.status(403).json({ error: 'Unauthorized access to this order' });
    }
    res.json(order);
  } catch (error) {
    console.error("Get Order Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.scheduleMeeting = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { location, time } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.buyer.toString() !== req.user.id || order.status !== 'pending' || order.trackingStatus !== 'paid') {
      console.log("Authorization failed - Buyer:", order.buyer.toString(), "User:", req.user.id, "Status:", order.status, "Tracking:", order.trackingStatus);
      return res.status(403).json({ error: 'Unauthorized or invalid status' });
    }

    order.trackingStatus = 'meeting_scheduled';
    order.meetingDetails = { location, time };
    await order.save();
    res.json(order);
  } catch (error) {
    console.error("Schedule Meeting Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.releaseFunds = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('seller');
    if (order.buyer.toString() !== req.user.id || order.trackingStatus !== 'meeting_scheduled' || order.status !== 'pending') {
      return res.status(403).json({ error: 'Unauthorized or invalid status' });
    }
    order.trackingStatus = 'completed';
    order.status = 'completed';
    await order.save();
    // Paystack payout logic...
    res.json(order);
  } catch (error) {
    console.error("Release Funds Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.retractFunds = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const order = await Order.findById(orderId).populate('item');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.buyer.toString() !== req.user.id || order.trackingStatus !== 'meeting_scheduled' || order.status !== 'pending') {
      return res.status(403).json({ error: 'Unauthorized or invalid status' });
    }

    // Restore item quantity
    const item = order.item;
    item.quantity += order.quantity; // Restore the quantity from the order
    item.status = item.quantity > 0 ? 'available' : item.status; // Ensure status is 'available' if quantity > 0
    await item.save();

    // Update order status
    order.trackingStatus = 'refunded'; // Updated to 'refunded' to reflect completion
    order.status = 'cancelled'; // Update legacy status
    order.refundReason = reason;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error("Retract Funds Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.rateSeller = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rating } = req.body;
    const order = await Order.findById(orderId).populate('seller');
    if (order.buyer.toString() !== req.user.id || order.trackingStatus !== 'completed') {
      return res.status(403).json({ error: 'Unauthorized or invalid status' });
    }
    const seller = order.seller;
    const newRatingCount = (seller.ratingCount || 0) + 1;
    const newRating = ((seller.rating || 0) * (seller.ratingCount || 0) + rating) / newRatingCount;
    seller.rating = newRating;
    seller.ratingCount = newRatingCount;
    await seller.save();
    res.json(order);
  } catch (error) {
    console.error("Rate Seller Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Export all functions
module.exports = {
  createOrder: exports.createOrderRoute,
  getUserPurchases: exports.getUserPurchases,
  getUserSales: exports.getUserSales,
  verifyPayment: exports.verifyPayment,
  getOrderById: exports.getOrderById,
  releaseFunds: exports.releaseFunds,
  retractFunds: exports.retractFunds,
  rateSeller: exports.rateSeller,
  scheduleMeeting: exports.scheduleMeeting,
};