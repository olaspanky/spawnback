// scripts/dropIndex.js
require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  try {
    await mongoose.connection.collection('orders').dropIndex('paymentReference_1');
    console.log('✅ Dropped stale paymentReference index');
  } catch (err) {
    if (err.code === 27) {
      console.log('ℹ️  Index not found — already gone');
    } else {
      console.error('❌ Error:', err.message);
    }
  } finally {
    await mongoose.disconnect();
  }
}

run();