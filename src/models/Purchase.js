const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      storeId: { type: String, required: true }, // From cart, to identify store
      item: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Good', required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  serviceCharge: {
    type: Number,
    required: true,
  },
  deliveryFee: {
    type: Number,
    required: true,
  },
  dropOffLocation: {
    type: String,
    required: true,
  },
  addressDetails: {
    type: String,
    required: true,
  },
  paymentReference: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Purchase', PurchaseSchema);