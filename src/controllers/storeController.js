const Store = require('../models/store');
const Item = require('../models/Items');
const cloudinary = require('../../config/cloudinary');
const upload = require('../middlewares/multer');

const createStore = async (req, res) => {
  try {
    const { name, description, location, storeImage } = req.body;
    const store = new Store({
      name,
      description,
      location,
      storeImage,
      owner: req.user.id
    });
    await store.save();
    res.json(store);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


const addStoreItem = async (req, res) => {
  try {
    const { storeId, itemName, measurement, price } = req.body;
    console.log("Received payload:", req.body);

    // Validate input
    if (!storeId || !itemName || !measurement || price === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
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

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    if (store.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "User not authorized" });
    }

    // Handle image upload
    let imageUrl = '';
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'store_items' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      imageUrl = result.secure_url;
    }

    const storeItem = {
      name: itemName,
      measurement: {
        unit: measurementData.unit,
        value: value,
        ...(measurementData.unit === "custom" && { customUnit: measurementData.customUnit }),
      },
      price: priceValue,
      image: imageUrl,
      available: value > 0,
    };

    store.items.push(storeItem);
    await store.save();
    res.json(store);
  } catch (err) {
    console.error("Add store item error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

const createPackageDeal = async (req, res) => {
  try {
    const { storeId, name, description, items, discountPercentage, price } = req.body;
    const store = await Store.findById(storeId);
    if (!store) return res.status(404).json({ message: 'Store not found' });
    if (store.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }
    
    // Validate package items using name reference
    for (const packageItem of items) {
      const storeItem = store.items.find(i => i.name === packageItem.item); // Changed to use 'name'
      if (!storeItem || storeItem.quantity < packageItem.quantity) {
        return res.status(400).json({ message: `Insufficient quantity for ${packageItem.item}` });
      }
    }
    
    const packageDeal = { 
      name, 
      description, 
      items, 
      discountPercentage, 
      price, 
      active: true 
    };
    store.packageDeals.push(packageDeal);
    await store.save();
    res.json(store);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.storeId).populate('owner', 'name');
    if (!store) return res.status(404).json({ message: 'Store not found' });
    res.json(store);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
const updateStoreItemQuantity = async (req, res) => {
  try {
    const { storeId, itemId, quantity } = req.body;
    const store = await Store.findById(storeId);
    if (!store) return res.status(404).json({ message: 'Store not found' });
    if (store.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }
    
    // Find by embedded document's _id
    const storeItem = store.items.id(itemId);
    if (!storeItem) return res.status(404).json({ message: 'Item not found' });
    
    storeItem.quantity = quantity;
    storeItem.available = quantity > 0;
    await store.save();
    res.json(store);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const togglePackageDeal = async (req, res) => {
  try {
    const { storeId, packageId } = req.params;
    const store = await Store.findById(storeId);
    if (!store) return res.status(404).json({ message: 'Store not found' });
    if (store.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }
    const packageDeal = store.packageDeals.id(packageId);
    if (!packageDeal) return res.status(404).json({ message: 'Package deal not found' });
    packageDeal.active = !packageDeal.active;
    await store.save();
    res.json(store);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getUserStores = async (req, res) => { // Fixed: removed items.item population
  try {
    const stores = await Store.find({ owner: req.params.userId })
      .populate('owner', 'name');
    res.json(stores);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find().populate("owner", "name"); // Changed from "username" to "name"
    res.json(stores);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
};

const editStoreItem = async (req, res) => {
  try {
    const { storeId, itemId, itemName, measurement, price } = req.body;

    // Validate input
    if (!storeId || !itemId || !itemName || !measurement || price === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const measurementData = typeof measurement === 'string' ? JSON.parse(measurement) : measurement;
   
    if (measurementData.unit === "custom" && !measurementData.customUnit) {
      return res.status(400).json({ message: "Custom unit required" });
    }
    const value = Number(measurementData.value);
    const priceValue = Number(price);
    if (isNaN(value) || value < 0) {
      return res.status(400).json({ message: "Measurement value must be non-negative" });
    }
    if (isNaN(priceValue) || priceValue < 0) {
      return res.status(400).json({ message: "Price must be a non-negative number" });
    }

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    if (store.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "User not authorized" });
    }

    const storeItem = store.items.id(itemId);
    if (!storeItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Handle image upload
    let imageUrl = storeItem.image;
    if (req.file) {
      // Delete old image if exists
      if (storeItem.image) {
        const publicId = storeItem.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`store_items/${publicId}`);
      }
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'store_items' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      imageUrl = result.secure_url;
    }

    // Update item fields
    storeItem.name = itemName;
    storeItem.measurement = {
      unit: measurementData.unit,
      value,
      ...(measurementData.unit === "custom" && { customUnit: measurementData.customUnit }),
    };
    storeItem.price = priceValue;
    storeItem.image = imageUrl;
    storeItem.available = value > 0;

    await store.save();
    res.json(store);
  } catch (err) {
    console.error("Edit store item error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

const deleteStoreItem = async (req, res) => {
  try {
    const { storeId, itemId } = req.params;
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    if (store.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "User not authorized" });
    }

    const storeItem = store.items.id(itemId);
    if (!storeItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Delete image from Cloudinary if it exists
    if (storeItem.image) {
      const publicId = storeItem.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`store_items/${publicId}`);
    }

    store.items.pull(itemId);
    await store.save();
    res.json(store);
  } catch (err) {
    console.error("Delete store item error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};


module.exports = {
  createStore,
  addStoreItem: [upload.single('image'), addStoreItem],
  editStoreItem: [upload.single('image'), editStoreItem],
  deleteStoreItem,
  createPackageDeal,
  getStore,
  updateStoreItemQuantity,
  togglePackageDeal,
  getUserStores,
  getAllStores,
};