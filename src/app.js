// // app.js
// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const multer = require('multer');
// const cloudinary = require('cloudinary').v2;
// const userRoutes = require('./routes/userRoutes');
// const messageRoutes = require('./routes/messageRoutes');
// const itemRoutes = require('./routes/itemRoutes');
// const authRoutes = require('./routes/authRoutes');
// const purchaseRoutes = require('./routes/purchaseRoutes');
// const storeRoutes = require('./routes/storeRoutes');
// const paymentRoutes = require('./routes/payment'); // Adjust path as needed


// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log(err));

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_API_KEY,
//   api_secret: process.env.CLOUD_API_SECRET
// });

// // Routes
// app.use('/api/users', userRoutes);
// app.use('/api', messageRoutes);
// app.use('/api', itemRoutes);
// app.use('/api/purchases', purchaseRoutes);
// app.use('/api/store', storeRoutes);
// app.use('/api/payment', paymentRoutes);

      
// module.exports = app;
// app.js


// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const cloudinary = require('cloudinary').v2;
// const userRoutes = require('./routes/userRoutes');
// const messageRoutes = require('./routes/messageRoutes');
// const itemRoutes = require('./routes/itemRoutes');
// const authRoutes = require('./routes/authRoutes');
// const purchaseRoutes = require('./routes/purchaseRoutes');
// const storeRoutes = require('./routes/storeRoutes');
// const paymentRoutes = require('./routes/payment');
// const shoppingListRoutes = require('./routes/shoppingListRoutes'); // Add this

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log(err));

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_API_KEY,
//   api_secret: process.env.CLOUD_API_SECRET
// });

// // Routes
// app.use('/api/users', userRoutes);
// app.use('/api', messageRoutes);
// app.use('/api', itemRoutes);
// app.use('/api/purchases', purchaseRoutes);
// app.use('/api/store', storeRoutes);
// app.use('/api/payment', paymentRoutes);
// app.use('/api/shopping-lists', shoppingListRoutes); // Add this

// module.exports = app;


const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Simple timeout middleware
const timeoutMiddleware = (req, res, next) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({ error: 'Request timeout' });
    }
  }, 8000); // 8 second timeout

  res.on('finish', () => clearTimeout(timeout));
  res.on('close', () => clearTimeout(timeout));
  next();
};

app.use(timeoutMiddleware);

// Test routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'API is working!', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mock goods routes
app.get('/api/goods', async (req, res) => {
  try {
    console.log('GET /api/goods called');
    
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const mockGoods = [
      {
        _id: '1',
        name: 'Rice',
        category: 'provisions_groceries',
        price: 1500,
        measurement: { unit: 'kg', value: 5 },
        available: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: '2', 
        name: 'Coca Cola',
        category: 'drinks',
        price: 200,
        measurement: { unit: 'bottle', value: 1 },
        available: true,
        createdAt: new Date().toISOString()
      }
    ];

    res.json(mockGoods);
  } catch (error) {
    console.error('Error in GET /api/goods:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/goods', async (req, res) => {
  try {
    console.log('POST /api/goods called with body:', req.body);
    
    const { name, price, category, measurement } = req.body;
    
    // Basic validation
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Missing required fields: name, price, category' });
    }

    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newGood = {
      _id: Date.now().toString(),
      name,
      price: Number(price),
      category,
      measurement: measurement || { unit: 'piece', value: 1 },
      available: true,
      createdAt: new Date().toISOString()
    };

    res.status(201).json(newGood);
  } catch (error) {
    console.error('Error in POST /api/goods:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/goods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`GET /api/goods/${id} called`);
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const mockGood = {
      _id: id,
      name: 'Sample Good',
      category: 'market_area',
      price: 500,
      measurement: { unit: 'kg', value: 2 },
      available: true,
      createdAt: new Date().toISOString()
    };

    res.json(mockGood);
  } catch (error) {
    console.error('Error in GET /api/goods/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mock categories
app.get('/api/categories', (req, res) => {
  const categories = [
    'market_area',
    'package_deals', 
    'drinks',
    'provisions_groceries'
  ];
  res.json(categories);
});

// Mock stats
app.get('/api/goods/stats/categories', async (req, res) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const stats = {
      total: 50,
      categories: {
        market_area: { total: 15, available: 12 },
        package_deals: { total: 8, available: 6 },
        drinks: { total: 12, available: 10 },
        provisions_groceries: { total: 15, available: 13 }
      }
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error in stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;