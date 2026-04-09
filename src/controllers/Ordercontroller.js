const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');

// Valid order statuses matching the MarketRuz workflow
const VALID_STATUSES = ['pending', 'accepted', 'in_market', 'delivered', 'completed'];

// Valid service types matching the OrderForm component
const VALID_SERVICES = ['timeframe', 'express'];

// ─────────────────────────────────────────────
// @desc    Submit a new order from the OrderForm
// @route   POST /api/orders
// @access  Public
// ─────────────────────────────────────────────
const createOrder = asyncHandler(async (req, res) => {
  const { name, phone, address, service, notes, file } = req.body;

  // ── Required field validation ──
  if (!name || !phone || !address || !service) {
    res.status(400);
    throw new Error('Please provide name, phone, address, and service type');
  }

  if (!VALID_SERVICES.includes(service)) {
    res.status(400);
    throw new Error(`Invalid service type. Must be one of: ${VALID_SERVICES.join(', ')}`);
  }

  // ── Optional file validation (uploaded separately via Cloudinary or similar) ──
  if (file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.mimeType)) {
      res.status(400);
      throw new Error('Shopping list file must be an image, PDF, or text file');
    }

    if (!file.url || !file.publicId || !file.originalName || !file.mimeType) {
      res.status(400);
      throw new Error('Invalid file metadata: url, publicId, originalName, and mimeType are required');
    }
  }

  const order = await Order.create({
    name: name.trim(),
    phone: phone.trim(),
    address: address.trim(),
    service,                          // 'timeframe' | 'express'
    notes: notes?.trim() || '',
    file: file || null,               // { url, publicId, originalName, mimeType }
    status: 'pending',                // All orders start as pending
  });

  res.status(201).json({
    success: true,
    message: 'Order submitted successfully',
    data: order,
  });
});

// ─────────────────────────────────────────────
// @desc    Get all orders
// @route   GET /api/orders
// @access  Private (Admin)
// ─────────────────────────────────────────────
const getAllOrders = asyncHandler(async (req, res) => {
  if (!req.user?.isAdmin) {
    res.status(403);
    throw new Error('Not authorized as admin');
  }

  // Optional filters via query params: ?status=pending&service=express
  const filter = {};
  if (req.query.status) {
    if (!VALID_STATUSES.includes(req.query.status)) {
      res.status(400);
      throw new Error(`Invalid status filter. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }
    filter.status = req.query.status;
  }
  if (req.query.service) {
    if (!VALID_SERVICES.includes(req.query.service)) {
      res.status(400);
      throw new Error(`Invalid service filter. Must be one of: ${VALID_SERVICES.join(', ')}`);
    }
    filter.service = req.query.service;
  }

  const orders = await Order.find(filter).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// ─────────────────────────────────────────────
// @desc    Get a single order by ID
// @route   GET /api/orders/:id
// @access  Private (Admin)
// ─────────────────────────────────────────────
const getOrderById = asyncHandler(async (req, res) => {
  if (!req.user?.isAdmin) {
    res.status(403);
    throw new Error('Not authorized as admin');
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json({
    success: true,
    data: order,
  });
});

// ─────────────────────────────────────────────
// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Admin)
// ─────────────────────────────────────────────
const updateOrderStatus = asyncHandler(async (req, res) => {
  if (!req.user?.isAdmin) {
    res.status(403);
    throw new Error('Not authorized as admin');
  }

  const { status } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }

  if (!VALID_STATUSES.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // ── Enforce forward-only status progression ──
  const currentIndex = VALID_STATUSES.indexOf(order.status);
  const newIndex = VALID_STATUSES.indexOf(status);

  if (newIndex < currentIndex) {
    res.status(400);
    throw new Error(
      `Cannot revert status from '${order.status}' back to '${status}'. Status can only move forward.`
    );
  }

  order.status = status;
  await order.save();

  res.json({
    success: true,
    message: `Order status updated to '${status}'`,
    data: order,
  });
});

module.exports = { createOrder, getAllOrders, getOrderById, updateOrderStatus };