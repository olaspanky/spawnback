const Purchase = require('../models/Purchase');
const Store = require('../models/Purchase');

const createPurchase = async (req, res) => {
  try {
    const { storeId, items, total } = req.body;
    const store = await Store.findById(storeId);
    if (!store) return res.status(404).json({ message: 'Store not found' });

    // Validate items and update availability
    for (const purchaseItem of items) {
      const storeItem = store.items.id(purchaseItem.itemId);
      if (!storeItem || !storeItem.available || storeItem.measurement.value < purchaseItem.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${storeItem.name}` });
      }
      storeItem.measurement.value -= purchaseItem.quantity;
      storeItem.available = storeItem.measurement.value > 0;
    }

    const purchase = new Purchase({
      user: req.user.id,
      store: storeId,
      items,
      total,
    });

    await store.save(); // Update stock
    await purchase.save();
    res.json(purchase);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = { createPurchase };