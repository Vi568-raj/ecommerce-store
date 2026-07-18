// middleware/admin.js
// Restricts a route to users with role "admin". Must run AFTER the `protect` middleware.

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied: admin privileges required' });
};

module.exports = { admin };
