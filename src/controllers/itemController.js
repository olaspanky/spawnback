// controllers/itemController.js
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

// controllers/authController.js
exports.authTest = (req, res) => {
  res.json({ message: 'Authenticated!', user: req.user });
};