const Good = require('../models/Good');
const cloudinary = require('../../config/cloudinary');
const upload = require('../middlewares/multer');
const Purchase = require('../models/Purchase'); // Add this import


// Categories enum for validation
const CATEGORIES = {
  MARKET_AREA: 'market_area',
  PACKAGE_DEALS: 'package_deals', 
  DRINKS: 'drinks',
  PROVISIONS_GROCERIES: 'provisions_groceries'
};

// Create a new good (admin only)
const createGood = async (req, res) => {
  try {
    const { name, description, measurement, price, category, isPackageDeal, packageItems } = req.body;
    
    // Validate required fields
    if (!name || !measurement || price === undefined || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate category
    if (!Object.values(CATEGORIES).includes(category)) {
      return res.status(400).json({ 
        message: "Invalid category. Must be one of: market_area, package_deals, drinks, provisions_groceries" 
      });
    }

    const measurementData = typeof measurement === 'string' ? JSON.parse(measurement) : measurement;
    
    if (measurementData.unit === "custom" && !measurementData.customUnit) {
      return res.status(400).json({ message: "Custom unit required for custom measurement" });
    }

    const value = Number(measurementData.value);
    if (isNaN(value) || value < 0) {
      return res.status(400).json({ message: "Measurement value must be a non-negative number" });
    }

    const priceValue = Number(price);
    if (isNaN(priceValue) || priceValue < 0) {
      return res.status(400).json({ message: "Price must be a non-negative number" });
    }

    // Handle image upload
    let imageUrl = '';
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'goods_images' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      imageUrl = result.secure_url;
    }

    const goodData = {
      name,
      description: description || '',
      measurement: {
        unit: measurementData.unit,
        value: value,
        ...(measurementData.unit === "custom" && { customUnit: measurementData.customUnit }),
      },
      price: priceValue,
      category,
      image: imageUrl,
      available: value > 0,
      isPackageDeal: isPackageDeal || false
    };

    // If it's a package deal, add package items
    if (isPackageDeal && packageItems) {
      const parsedPackageItems = typeof packageItems === 'string' ? 
        JSON.parse(packageItems) : packageItems;
      goodData.packageItems = parsedPackageItems;
    }

    const good = new Good(goodData);
    await good.save();
    
    res.status(201).json(good);
  } catch (err) {
    console.error("Create good error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// Get all goods with optional category filtering
const getAllGoods = async (req, res) => {
  try {
    const { category, available, search } = req.query;
    let filter = {};

    // Filter by category
    if (category && Object.values(CATEGORIES).includes(category)) {
      filter.category = category;
    }

    // Filter by availability
    if (available !== undefined) {
      filter.available = available === 'true';
    }

    // Search by name or description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const goods = await Good.find(filter).sort({ createdAt: -1 });
    res.json(goods);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get goods by category
const getGoodsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!Object.values(CATEGORIES).includes(category)) {
      return res.status(400).json({ 
        message: "Invalid category. Must be one of: market_area, package_deals, drinks, provisions_groceries" 
      });
    }

    const goods = await Good.find({ category }).sort({ createdAt: -1 });
    res.json(goods);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single good by ID
const getGood = async (req, res) => {
  try {
    const good = await Good.findById(req.params.goodId);
    if (!good) {
      return res.status(404).json({ message: 'Good not found' });
    }
    res.json(good);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Update good (admin only)
const updateGood = async (req, res) => {
  try {
    const { goodId } = req.params;
    const { name, description, measurement, price, category, isPackageDeal, packageItems } = req.body;

    const good = await Good.findById(goodId);
    if (!good) {
      return res.status(404).json({ message: "Good not found" });
    }

    // Validate category if provided
    if (category && !Object.values(CATEGORIES).includes(category)) {
      return res.status(400).json({ 
        message: "Invalid category. Must be one of: market_area, package_deals, drinks, provisions_groceries" 
      });
    }

    // Handle measurement update
    if (measurement) {
      const measurementData = typeof measurement === 'string' ? JSON.parse(measurement) : measurement;
      
      if (measurementData.unit === "custom" && !measurementData.customUnit) {
        return res.status(400).json({ message: "Custom unit required" });
      }

      const value = Number(measurementData.value);
      if (isNaN(value) || value < 0) {
        return res.status(400).json({ message: "Measurement value must be non-negative" });
      }

      good.measurement = {
        unit: measurementData.unit,
        value,
        ...(measurementData.unit === "custom" && { customUnit: measurementData.customUnit }),
      };
      good.available = value > 0;
    }

    // Handle price update
    if (price !== undefined) {
      const priceValue = Number(price);
      if (isNaN(priceValue) || priceValue < 0) {
        return res.status(400).json({ message: "Price must be a non-negative number" });
      }
      good.price = priceValue;
    }

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (good.image) {
        const publicId = good.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`goods_images/${publicId}`);
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'goods_images' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      good.image = result.secure_url;
    }

    // Update other fields
    if (name) good.name = name;
    if (description !== undefined) good.description = description;
    if (category) good.category = category;
    if (isPackageDeal !== undefined) good.isPackageDeal = isPackageDeal;
    
    if (isPackageDeal && packageItems) {
      const parsedPackageItems = typeof packageItems === 'string' ? 
        JSON.parse(packageItems) : packageItems;
      good.packageItems = parsedPackageItems;
    }

    await good.save();
    res.json(good);
  } catch (err) {
    console.error("Update good error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// Delete good (admin only)
const deleteGood = async (req, res) => {
  try {
    const { goodId } = req.params;
    
    const good = await Good.findById(goodId);
    if (!good) {
      return res.status(404).json({ message: "Good not found" });
    }

    // Delete image from Cloudinary if it exists
    if (good.image) {
      const publicId = good.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`goods_images/${publicId}`);
    }

    await Good.findByIdAndDelete(goodId);
    res.json({ message: "Good deleted successfully" });
  } catch (err) {
    console.error("Delete good error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// Toggle good availability (admin only)
const toggleAvailability = async (req, res) => {
  try {
    const { goodId } = req.params;
    
    const good = await Good.findById(goodId);
    if (!good) {
      return res.status(404).json({ message: 'Good not found' });
    }

    good.available = !good.available;
    await good.save();
    
    res.json(good);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get category statistics
const getCategoryStats = async (req, res) => {
  try {
    const stats = await Good.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          availableCount: { 
            $sum: { $cond: ['$available', 1, 0] } 
          },
          totalValue: { $sum: '$price' },
          averagePrice: { $avg: '$price' }
        }
      }
    ]);

    const formattedStats = {
      total: await Good.countDocuments(),
      categories: {}
    };

    stats.forEach(stat => {
      formattedStats.categories[stat._id] = {
        total: stat.count,
        available: stat.availableCount,
        totalValue: stat.totalValue,
        averagePrice: Math.round(stat.averagePrice * 100) / 100
      };
    });

    res.json(formattedStats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};


const confirmPayment = async (req, res) => {
  try {
    const { cart, paymentReference } = req.body;
    const userId = req.user.id; // From authMiddleware

    // Validate inputs
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: 'Cart is required and must not be empty' });
    }
    if (!paymentReference || typeof paymentReference !== 'string') {
      return res.status(400).json({ message: 'Payment reference is required' });
    }

    // Validate cart items and calculate total
    let totalAmount = 0;
    const purchaseItems = [];

    for (const cartItem of cart) {
      const { storeId, item, quantity } = cartItem;

      if (!storeId || !item?._id || !quantity || quantity < 1) {
        return res.status(400).json({ message: 'Invalid cart item format' });
      }

      // Verify the item exists in the database
      const good = await Good.findById(item._id);
      if (!good) {
        return res.status(404).json({ message: `Item with ID ${item._id} not found` });
      }
      if (!good.available) {
        return res.status(400).json({ message: `Item ${good.name} is not available` });
      }

      // Validate price consistency
      if (item.price !== good.price) {
        return res.status(400).json({ message: `Price mismatch for item ${good.name}` });
      }

      totalAmount += good.price * quantity;

      purchaseItems.push({
        storeId,
        item: {
          _id: good._id,
          name: good.name,
          price: good.price,
          quantity,
        },
      });
    }

    // Create purchase record
    const purchase = new Purchase({
      userId,
      items: purchaseItems,
      totalAmount,
      paymentReference,
      status: 'pending', // Admin will confirm after verifying payment
    });

    await purchase.save();

    res.status(200).json({
      message: 'Payment reference submitted successfully',
      purchaseId: purchase._id,
    });
  } catch (err) {
    console.error('Confirm payment error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Get all purchases (admin only)
const getAllPurchases = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const purchases = await Purchase.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });

    res.json(purchases);
  } catch (err) {
    console.error('Get all purchases error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Get user purchases
const getUserPurchases = async (req, res) => {
  try {
    const userId = req.user.id;
    const purchases = await Purchase.find({ userId })
      .sort({ createdAt: -1 });
    res.json(purchases);
  } catch (err) {
    console.error('Get user purchases error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

const updatePurchaseStatus = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { purchaseId } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    purchase.status = status;
    await purchase.save();

    res.json({ message: `Purchase status updated to ${status}`, purchase });
  } catch (err) {
    console.error('Update purchase status error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// Add to exports
module.exports = {
  createGood: [upload.single('image'), createGood],
  updateGood: [upload.single('image'), updateGood],
  deleteGood,
  getAllGoods,
  getGoodsByCategory,
  getGood,
  toggleAvailability,
  getCategoryStats,
  confirmPayment,
  getAllPurchases,
  getUserPurchases,
  updatePurchaseStatus,
  CATEGORIES,
};