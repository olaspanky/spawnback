// models/Order.js remains unchanged
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  item: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  paymentReference: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);