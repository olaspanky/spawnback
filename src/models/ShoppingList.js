const mongoose = require('mongoose');

const shoppingListSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactMethod: { type: String, enum: ['email', 'phone'], required: true },
  contactValue: { type: String, required: true },
  files: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
  }],
  status: {
    type: String,
    enum: ['Price Verification', 'Paid', 'Processing', 'En Route', 'Delivered', 'Failed'],
    default: 'Price Verification',
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Optional
}, { timestamps: true });

module.exports = mongoose.model('ShoppingList', shoppingListSchema);