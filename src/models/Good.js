const mongoose = require('mongoose');

const packageItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  description: String
});

const measurementSchema = new mongoose.Schema({
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'lbs', 'pieces', 'liters', 'ml', 'custom']
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  customUnit: {
    type: String,
    required: function() {
      return this.unit === 'custom';
    }
  }
});

const goodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  measurement: {
    type: measurementSchema,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['market_area', 'package_deals', 'drinks', 'provisions_groceries', 'meal_prep', 'frozen_foods']
  },
  image: {
    type: String,
    default: ''
  },
  available: {
    type: Boolean,
    default: true
  },
  isPackageDeal: {
    type: Boolean,
    default: false
  },
  packageItems: {
    type: [packageItemSchema],
    default: [],
    validate: {
      validator: function(items) {
        // If isPackageDeal is true, packageItems should not be empty
        if (this.isPackageDeal) {
          return items && items.length > 0;
        }
        return true;
      },
      message: 'Package deals must have at least one package item'
    }
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
goodSchema.index({ category: 1 });
goodSchema.index({ available: 1 });
goodSchema.index({ name: 'text', description: 'text' });
goodSchema.index({ createdAt: -1 });
goodSchema.index({ price: 1 });
goodSchema.index({ featured: -1, createdAt: -1 });

// Virtual for formatted price
goodSchema.virtual('formattedPrice').get(function() {
  return `₦${this.price.toLocaleString()}`;
});

// Virtual for category display name
goodSchema.virtual('categoryDisplay').get(function() {
  const categoryMap = {
    'market_area': 'Market Area',
    'package_deals': 'Package Deals',
    'meal_prep': 'Meal Prep',
    'frozen_foods': 'Frozen Foods',
    'drinks': 'Drinks',
    'provisions_groceries': 'Provisions & Groceries'
  };
  return categoryMap[this.category] || this.category;
});

// Virtual for measurement display
goodSchema.virtual('measurementDisplay').get(function() {
  const unit = this.measurement.unit === 'custom' ? 
    this.measurement.customUnit : this.measurement.unit;
  return `${this.measurement.value} ${unit}`;
});

// Method to increment views
goodSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to update rating
goodSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (currentTotal + newRating) / this.rating.count;
  return this.save();
};

// Static method to get featured goods
goodSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ featured: true, available: true })
    .limit(limit)
    .sort({ createdAt: -1 });
};

// Static method to get goods by category with pagination
goodSchema.statics.getByCategory = function(category, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return this.find({ category, available: true })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};

// Static method to search goods
goodSchema.statics.searchGoods = function(query, category = null, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  let searchFilter = {
    $text: { $search: query },
    available: true
  };

  if (category) {
    searchFilter.category = category;
  }

  return this.find(searchFilter, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit);
};

// Pre-save middleware to set category for package deals
goodSchema.pre('save', function(next) {
  if (this.isPackageDeal && this.category !== 'package_deals') {
    this.category = 'package_deals';
  }
  next();
});

// Pre-save middleware to validate package deal structure
goodSchema.pre('save', function(next) {
  if (this.isPackageDeal) {
    if (!this.packageItems || this.packageItems.length === 0) {
      return next(new Error('Package deals must have at least one package item'));
    }
  }
  next();
});

module.exports = mongoose.model('Good', goodSchema);