// src/app.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const authRoutes = require('./routes/Authroutes');
const orderRoutes = require('./routes/OrderRoutes');
const { errorHandler, notFound } = require('./middlewares/Errormiddleware');

const app = express();

// ─── Cloudinary Configuration ─────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key:    process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
 timeout:    60000, // ← Add this: 60s timeout (default is ~20s)

});

// ─── Multer Setup ─────────────────────────────────────────────────
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ─── Security & Middleware ────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many orders submitted, please try again later.' },
});

// Add this BEFORE app.use(notFound);

// ─── Root Route (Welcome / Health for localhost) ─────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to MarketRuz API',
    version: '1.0',
    endpoints: {
      health: '/api/health',
      upload: 'POST /api/upload',
      auth: '/api/auth',
      orders: '/api/orders'
    }
  });
});

app.use(limiter);

// ─── File Upload Endpoint ─────────────────────────────────────────
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file provided' 
      });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'marketruz/shopping-lists',
          resource_type: 'auto',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'txt'],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.json({
      success: true,
      file: {
        url:          result.secure_url,
        publicId:     result.public_id,
        originalName: req.file.originalname,
        mimeType:     req.file.mimetype,
        format:       result.format,
      },
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'File upload failed. Please try again.' 
    });
  }
});

// ─── Routes ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderLimiter, orderRoutes);

// ─── Health Check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'MarketRuz API is running' })
);

app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'MarketRuz API is running' })
);

// Root Route - Add this
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to MarketRuz API',
    docs: 'Try /api/health'
  });
});
// ─── Error Handling ───────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── MongoDB Connection (Cached for Vercel Serverless) ────────────
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log('✅ Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = { bufferCommands: false };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('✅ MongoDB connected successfully');
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Connect database when the app is required (lazy + safe for Vercel)
connectDB().catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
});

// Export the app (used by both Vercel and local index.js)
module.exports = app;