// ─── controllers/authController.js ───────────────────────────────────────────
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// @desc    Register the first admin (run once, then disable or guard)
// @route   POST /api/auth/register
// @access  Public (lock down after first use)
const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  if (password.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters');
  }

  const exists = await Admin.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(409);
    throw new Error('An admin with this email already exists');
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const admin = await Admin.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    isAdmin: true,
  });

  res.status(201).json({
    success: true,
    message: 'Admin created successfully',
    data: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id),
    },
  });
});

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
  if (!admin) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  res.json({
    success: true,
    data: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      
      token: generateToken(admin._id),
    },
  });
});

// @desc    Get current logged-in admin profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user._id);
  res.json({
    success: true,
    data: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      isAdmin: admin.isAdmin,
    },
  });
});

module.exports = { registerAdmin, loginAdmin, getMe };


// ─── middleware/auth.js ───────────────────────────────────────────────────────
// Put this section in a separate file: middleware/auth.js

/*
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Verifies JWT and attaches req.user
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorised, no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Admin.findById(decoded.id).select('-password');
    if (!req.user) {
      res.status(401);
      throw new Error('User belonging to this token no longer exists');
    }
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorised, token invalid or expired');
  }
});

// Ensures the authenticated user is an admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next();
  res.status(403);
  throw new Error('Not authorised as admin');
};

module.exports = { protect, adminOnly };
*/