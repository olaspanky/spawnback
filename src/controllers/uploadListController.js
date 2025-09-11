const asyncHandler = require('express-async-handler');
const ShoppingList = require('../models/ShoppingList');

// @desc    Create shopping list with uploaded file metadata
// @route   POST /api/shopping-lists
// @access  Public
const createShoppingList = asyncHandler(async (req, res) => {
  const { name, contactMethod, contactValue, files } = req.body;

  // Validate inputs
  if (!name || !contactMethod || !contactValue) {
    res.status(400);
    throw new Error('Please provide name, contact method, and contact value');
  }

  if (!['email', 'phone'].includes(contactMethod)) {
    res.status(400);
    throw new Error('Invalid contact method');
  }

  // Validate files
  if (!files || !Array.isArray(files) || files.length === 0) {
    res.status(400);
    throw new Error('At least one file is required');
  }

  if (files.length > 4) {
    res.status(400);
    throw new Error('Maximum 4 files allowed');
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  for (const file of files) {
    if (!allowedTypes.includes(file.mimeType)) {
      res.status(400);
      throw new Error('Only JPEG, PNG, or PDF files are allowed');
    }
    if (!file.url || !file.publicId || !file.originalName || !file.mimeType) {
      res.status(400);
      throw new Error('Invalid file metadata: url, publicId, originalName, and mimeType are required');
    }
    // Validate URL format (basic check for Cloudinary URL)
    if (!file.url.startsWith('https://res.cloudinary.com/')) {
      res.status(400);
      throw new Error('Invalid file URL format');
    }
  }

  try {
    // Create shopping list (no user field, as authentication is not required)
    const shoppingList = await ShoppingList.create({
      name,
      contactMethod,
      contactValue,
      files,
      status: 'Price Verification', // Default status
    });

    res.status(201).json({
      success: true,
      message: 'Shopping list uploaded successfully',
      data: shoppingList,
    });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to create shopping list: ' + error.message);
  }
});

// @desc    Get all shopping lists (admin only)
// @route   GET /api/shopping-lists
// @access  Private (Admin)
const getAllShoppingLists = asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized as admin');
  }

  const shoppingLists = await ShoppingList.find();
  res.json({
    success: true,
    data: shoppingLists,
  });
});

// @desc    Update shopping list status (admin only)
// @route   PUT /api/shopping-lists/:id
// @access  Private (Admin)
const updateShoppingListStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['Price Verification', 'Paid', 'Processing', 'En Route', 'Delivered', 'Failed'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized as admin');
  }

  const shoppingList = await ShoppingList.findById(req.params.id);
  if (!shoppingList) {
    res.status(404);
    throw new Error('Shopping list not found');
  }

  shoppingList.status = status;
  await shoppingList.save();

  res.json({
    success: true,
    message: 'Status updated successfully',
    data: shoppingList,
  });
});

module.exports = { createShoppingList, getAllShoppingLists, updateShoppingListStatus };