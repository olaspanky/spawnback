// controllers/purchaseController.js
const Order = require('../models/Order');
const Item = require('../models/Items');
const axios = require('axios');

exports.createOrder = async (req) => {
  try {
    const { itemID, paymentReference } = req.body;
    const buyer = req.user.id;

    console.log("createOrder - itemID:", itemID, "buyer:", buyer);

    const item = await Item.findById(itemID);
    if (!item) {
      console.log("Item not found for itemID:", itemID);
      throw new Error('Item not found');
    }

    console.log("Item found:", item);

    const order = new Order({
      buyer,
      seller: item.seller,
      item: itemID,
      price: item.price,
      paymentReference,
      status: 'pending',
    });

    await order.save();

    item.status = 'sold';
    await item.save();

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
    res.status(error.message === 'Item not found' ? 404 : 500).json({ error: error.message });
  }
};

exports.getUserPurchases = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate('item')
      .populate('seller', 'username verified');

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
    const { reference, itemID } = req.body;

    console.log("verifyPayment - reference:", reference, "itemID:", itemID, "user:", req.user);

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    console.log("Full Response:", response.data);

    const paymentData = response.data.data;

    if (!paymentData || paymentData.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Payment not verified',
        details: response.data.message || 'Unknown error',
      });
    }

    const order = await exports.createOrder({
      body: { itemID, paymentReference: reference },
      user: { id: req.user.id },
    });

    res.json({
      success: true,
      order,
      message: 'Payment verified and order created successfully',
    });
  } catch (error) {
    console.error("Payment Verification Error:", error.response ? error.response.data : error.message);
    res.status(error.message === 'Item not found' ? 404 : 500).json({
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
      .populate('seller', 'username verified');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.user.id !== order.buyer.toString() && req.user.id !== order.seller.toString()) {
      return res.status(403).json({ error: 'Unauthorized access to this order' });
    }

    res.json(order);
  } catch (error) {
    console.error("Get Order Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Export all functions correctly
module.exports = {
  createOrder: exports.createOrderRoute,
  getUserPurchases: exports.getUserPurchases,
  getUserSales: exports.getUserSales,
  verifyPayment: exports.verifyPayment,
  getOrderById: exports.getOrderById,
};