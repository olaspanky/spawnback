const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    minlength: [10, 'Title must be at least 10 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [1000, 'Price must be at least ₦1,000'],
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1,000 characters'],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Electronics',
      'Fashion',
      'Furniture',
      'Home & Appliances',
      'Books & Media',
      'Sports & Outdoors',
      'Toys & Games',
      'Vehicles',
      'Collectibles',
      'Other',
    ],
  },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: ['Brand New', 'Used - Like New', 'Used - Good', 'Used - Fair', 'For Parts'],
  },
  brand: {
    type: String,
    maxlength: [50, 'Brand cannot exceed 50 characters'],
  },
  model: {
    type: String,
    maxlength: [50, 'Model cannot exceed 50 characters'],
  },
  year: {
    type: Number,
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear(), 'Year cannot be in the future'],
  },
  dimensions: {
    type: String,
    maxlength: [100, 'Dimensions cannot exceed 100 characters'],
  },
  delivery: {
    type: String,
    enum: ['', 'Local Pickup', 'Delivery', 'Shipping'],
  },
  reason: {
    type: String,
    maxlength: [200, 'Reason cannot exceed 200 characters'],
  },
  contact: {
    type: String,
    enum: ['', 'App Chat', 'Phone', 'WhatsApp'],
  },
  images: {
    type: [String],
    validate: {
      validator: (arr) => arr.length >= 2 && arr.length <= 4,
      message: 'Must upload between 2 and 4 images',
    },
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'pending'],
    default: 'available',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Item', ItemSchema);