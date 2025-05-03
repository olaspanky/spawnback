// // models/Order.js remains unchanged
// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   buyer: { 
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   seller: { 
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   item: { 
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Item',
//     required: true
//   },
//   price: {
//     type: Number,
//     required: true
//   },
//   paymentReference: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'completed', 'cancelled'],
//     default: 'pending'
//   },
//   trackingStatus: {
//     type: String,
//     enum: ['paid', 'meeting_scheduled', 'item_received', 'completed', 'refunded'],
//     default: 'paid'
//   },
//   refundReason: String // For retract requests
// }, { timestamps: true });

// module.exports = mongoose.model('Order', orderSchema);

// models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1,
  },
  price: { type: Number, required: true },
  paymentReference: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' }, // Legacy
  trackingStatus: {
    type: String,
    enum: ['paid', 'meeting_scheduled', 'completed', 'refund_requested', 'refunded'],
    default: 'paid',
  },
  refundReason: { type: String },
  meetingDetails: {
    location: { type: String },
    time: { type: Date },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);