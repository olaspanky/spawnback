const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Changed to false to allow guest purchases
    default: null,
  },
  guestInfo: {
    name: { 
      type: String,
      required: false, // Required only for guest purchases
    },
    phone: { 
      type: String,
      required: false, // Required only for guest purchases
    },
    email: { 
      type: String,
      required: false, // Required only for guest purchases
    },
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

// Pre-save validation to ensure either userId OR guestInfo is provided
PurchaseSchema.pre('save', function(next) {
  if (!this.userId && (!this.guestInfo || !this.guestInfo.name || !this.guestInfo.phone || !this.guestInfo.email)) {
    return next(new Error('Either userId or complete guestInfo (name, phone, email) is required'));
  }
  next();
});

module.exports = mongoose.model('Purchase', PurchaseSchema);