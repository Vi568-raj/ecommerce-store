// server.js
// Entry point of the application. Sets up Express, connects to MongoDB,
// wires up middleware/routes, and starts the HTTP server.

const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Connect to MongoDB; if it is unavailable, continue in demo mode.
connectDB().catch(() => {});

const app = express();

// ---- Core middleware ----
app.use(cors());
app.use(express.json()); // parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev')); // log requests in development
}

// ---- Serve the vanilla HTML/CSS/JS frontend from /public ----
app.use(express.static(path.join(__dirname, 'public')));

// ---- API routes ----
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

// Fallback: any non-API route serves the frontend's index.html (helps with direct URL loads)
app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---- Error handling (must be registered last) ----
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
