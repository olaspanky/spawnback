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
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    await Item.findByIdAndRemove(req.params.id);
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
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