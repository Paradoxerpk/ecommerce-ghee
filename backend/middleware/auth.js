const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'saikrishnaghee_super_secret_session_token_key_12345';

// Mandatory authentication middleware
function requireAuth(req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Token format is invalid, must be Bearer <token>' });
  }

  try {
    const decoded = jwt.verify(parts[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

// Optional authentication middleware (extracts user payload if token is present, otherwise proceeds silently)
function optionalAuth(req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) return next();

  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    try {
      const decoded = jwt.verify(parts[1], JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Ignore token decoding error for optional auth
    }
  }
  next();
}

module.exports = requireAuth;
module.exports.requireAuth = requireAuth;
module.exports.optionalAuth = optionalAuth;
