const authMiddleware = require('./auth');

// Middleware to verify user is Admin or Staff
module.exports = [
  authMiddleware,
  (req, res, next) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'staff')) {
      return res.status(403).json({ message: 'Access denied. Admin or Staff authorization required.' });
    }
    next();
  }
];
