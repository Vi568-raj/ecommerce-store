// middleware/auth.js
// Protects routes by verifying the JWT sent in the Authorization header.

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isMongoConnected, findDemoUserById } = require('../utils/fallbackStore');

const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!isMongoConnected()) {
        req.user = findDemoUserById(decoded.id);
        if (!req.user) {
          return res.status(401).json({ success: false, message: 'User no longer exists' });
        }
        return next();
      }

      req.user = await User.findById(decoded.id);
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User no longer exists' });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
    }
  }

  return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
};

module.exports = { protect };
