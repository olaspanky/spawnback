const Item = require('../models/Item');

exports.createItem = async (req, res) => {
  try {
    const {
      title,
      price,
      quantity,
      description,
      location,
      category,
      condition,
      brand,
      model,
      year,
      dimensions,
      delivery,
      reason,
      contact,
      images,
    } = req.body;

    // Manual validation
    if (!title || title.length < 10 || title.length > 100) {
      return res.status(400).json({ msg: 'Title must be between 10 and 100 characters' });
    }
    if (!price || isNaN(price) || price < 1000) {
      return res.status(400).json({ msg: 'Price must be at least ₦1,000' });
    }
    if (quantity === undefined || isNaN(quantity) || quantity < 0) {
      return res.status(400).json({ msg: 'Quantity must be a non-negative number' });
    }
    if (!location) {
      return res.status(400).json({ msg: 'Location is required' });
    }
    const validCategories = [
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
    ];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({ msg: 'Invalid category' });
    }
    const validConditions = ['Brand New', 'Used - Like New', 'Used - Good', 'Used - Fair', 'For Parts'];
    if (!condition || !validConditions.includes(condition)) {
      return res.status(400).json({ msg: 'Invalid condition' });
    }
    if (!images || !Array.isArray(images) || images.length < 2 || images.length > 4) {
      return res.status(400).json({ msg: 'Must upload between 2 and 4 images' });
    }
    if (description && description.length > 1000) {
      return res.status(400).json({ msg: 'Description cannot exceed 1,000 characters' });
    }
    if (brand && brand.length > 50) {
      return res.status(400).json({ msg: 'Brand cannot exceed 50 characters' });
    }
    if (model && model.length > 50) {
      return res.status(400).json({ msg: 'Model cannot exceed 50 characters' });
    }
    if (year && (isNaN(year) || year < 1900 || year > new Date().getFullYear())) {
      return res.status(400).json({ msg: 'Year must be between 1900 and current year' });
    }
    if (dimensions && dimensions.length > 100) {
      return res.status(400).json({ msg: 'Dimensions cannot exceed 100 characters' });
    }
    const validDelivery = ['', 'Local Pickup', 'Delivery', 'Shipping'];
    if (delivery && !validDelivery.includes(delivery)) {
      return res.status(400).json({ msg: 'Invalid delivery option' });
    }
    if (reason && reason.length > 200) {
      return res.status(400).json({ msg: 'Reason cannot exceed 200 characters' });
    }
    const validContact = ['', 'App Chat', 'Phone', 'WhatsApp'];
    if (contact && !validContact.includes(contact)) {
      return res.status(400).json({ msg: 'Invalid contact preference' });
    }

    const item = new Item({
      title,
      price,
      quantity,
      description,
      location,
      category,
      condition,
      brand,
      model,
      year,
      dimensions,
      delivery,
      reason,
      contact,
      images,
      seller: req.user.id,
    });

    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getItems = async (req, res) => {
  try {
    const items = await Item.find({ quantity: { $gt: 0 } }).populate('seller', 'username');
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getItem = async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, quantity: { $gt: 0 } }).populate('seller', 'username');
    if (!item) return res.status(404).json({ message: 'Item not found or out of stock' });
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateItem = async (req, res) => {
  const { title, price, quantity, description, location, category, images } = req.body;

  try {
    let item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    // Update fields if provided
    if (title) item.title = title;
    if (price) item.price = price;
    if (quantity !== undefined) item.quantity = quantity;
    if (description) item.description = description;
    if (location) item.location = location;
    if (category) item.category = category;
    if (images) item.images = images;

    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid item ID format' });
    }

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    await Item.findByIdAndDelete(id);
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getItemsByUser = async (req, res) => {
  try {
    const items = await Item.find({ seller: req.params.userId }).populate('seller', 'username');
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};