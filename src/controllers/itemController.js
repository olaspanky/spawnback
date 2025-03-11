const Item = require('../models/Items');

exports.createItem = async (req, res) => {
  try {
    const { title, price, description, location, category, images } = req.body;

    const item = new Item({
      title,
      price,
      description,
      location,
      category,
      images,
      seller: req.user.id
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
    const items = await Item.find().populate('seller', 'username');
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('seller', 'username');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateItem = async (req, res) => {
  const { title, price, description, location, category, images } = req.body;

  try {
    let item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    item.title = title;
    item.price = price;
    item.description = description;
    item.location = location;
    item.category = category;
    item.images = images;

    await item.save();
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.deleteItem = async (req, res) => {
  try {
    // Validate ObjectId format
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid item ID format' });
    }

    // Find the item
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check authorization
    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    // Delete the item (use findByIdAndDelete for modern Mongoose)
    await Item.findByIdAndDelete(id);
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error('Delete error:', err); // Log full error object
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