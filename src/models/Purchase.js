const purchaseSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Changed to false to allow guest purchases
  },
  guestInfo: {
    name: { type: String },
    phone: { type: String },
    email: { type: String },
  },
  items: [{
    storeId: { type: String, required: true },
    item: {
      _id: { type: Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  }],
  totalAmount: { type: Number, required: true },
  serviceCharge: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  dropOffLocation: { type: String, required: true },
  addressDetails: { type: String, required: true },
  paymentReference: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true });