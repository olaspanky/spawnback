const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    url:          { type: String, required: true },
    publicId:     { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType:     { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    phone:   { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },

    service: {
      type: String,
      enum: ['timeframe', 'express'],
      required: true,
    },

    notes: { type: String, default: '', trim: true },

    file: { type: fileSchema, default: null },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_market', 'delivered', 'completed'],
      default: 'pending',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Order', orderSchema);