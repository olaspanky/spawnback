const Store = require('../models/store');
const Item = require('../models/Items');

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
    if (!measurement.unit || measurement.value === undefined || measurement.value === null) {
      return res.status(400).json({ message: `Invalid measurement data: value is ${measurement.value}` });
    }
    if (measurement.unit === "custom" && !measurement.customUnit) {
      return res.status(400).json({ message: "Custom unit required for custom measurement" });
    }
    const value = Number(measurement.value);
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

    const storeItem = {
      name: itemName,
      measurement: {
        unit: measurement.unit,
        value: value,
        ...(measurement.unit === "custom" && { customUnit: measurement.customUnit }),
      },
      price: priceValue,
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

// Centralized exports
module.exports = {
  createStore: createStore,
  addStoreItem: addStoreItem,
  createPackageDeal: createPackageDeal,
  getStore: getStore,
  updateStoreItemQuantity: updateStoreItemQuantity,
  togglePackageDeal: togglePackageDeal,
  getUserStores: getUserStores,
  getAllStores: getAllStores
};