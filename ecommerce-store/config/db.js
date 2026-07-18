// config/db.js
// Handles the MongoDB connection using Mongoose.
// If MongoDB is unavailable, the app continues in demo mode.

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`MongoDB unavailable; continuing in demo mode: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;
