const express = require('express');
const {
  createStore,
  addStoreItem,
  editStoreItem,
  deleteStoreItem,
  createPackageDeal,
  getStore,
  updateStoreItemQuantity,
  togglePackageDeal,
  getUserStores,
  getAllStores,

} = require('../controllers/storeController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Store Routes
router.post('/', authMiddleware, createStore);
router.post('/item', authMiddleware, addStoreItem);
router.put('/item/:itemId', authMiddleware, editStoreItem);
router.delete('/item/:itemId', authMiddleware, deleteStoreItem);
router.post('/package', authMiddleware, createPackageDeal);
router.get('/store', getAllStores);                      // Move this up
router.get('/user/:userId', getUserStores);
router.get('/:storeId', getStore);                      // Parameterized routes last
router.put('/item/quantity', authMiddleware, updateStoreItemQuantity);
router.put('/:storeId/package/:packageId/toggle', authMiddleware, togglePackageDeal);                    // GET /api/stores/user/:userId - Get all stores by user

module.exports = router;