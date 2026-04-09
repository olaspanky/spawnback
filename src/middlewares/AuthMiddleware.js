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