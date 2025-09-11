const Good = require('../models/Good');
const cloudinary = require('../../config/cloudinary');
const upload = require('../middlewares/multer');

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

module.exports = {
  createGood: [upload.single('image'), createGood],
  updateGood: [upload.single('image'), updateGood],
  deleteGood,
  getAllGoods,
  getGoodsByCategory,
  getGood,
  toggleAvailability,
  getCategoryStats,
  CATEGORIES
};