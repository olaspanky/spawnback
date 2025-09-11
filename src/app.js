
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const itemRoutes = require('./routes/itemRoutes');
const authRoutes = require('./routes/authRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const storeRoutes = require('./routes/storeRoutes');
const paymentRoutes = require('./routes/payment');
const shoppingListRoutes = require('./routes/shoppingListRoutes'); // Add this

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api', messageRoutes);
app.use('/api', itemRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/shopping-lists', shoppingListRoutes); // Add this

module.exports = app;