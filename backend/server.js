const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend connection
app.use(cors({
  origin: '*', // For demo ease, can restrict to specific domains in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Database connection pool setup
const db = require('./db');

// Database connection check
db.pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed. Please ensure PostgreSQL/Supabase is running and configured correctly in .env.');
    console.error(err.message);
  } else {
    console.log('✅ Connected to PostgreSQL database successfully.');
    release();
  }
});

// Setup routes (we import them here after defining db module to avoid circular dependencies)
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const inquiryRoutes = require('./routes/inquiries');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inquiries', inquiryRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({
    message: 'Sai Krishna Ghee Store Backend API is active',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Centralized error handler for safety
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: true,
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred. Please try again.' 
      : err.message
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
