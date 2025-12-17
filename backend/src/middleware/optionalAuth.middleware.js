// src/middleware/optionalAuth.middleware.js
const jwt = require('jsonwebtoken');

// Optional authentication - sets req.user if token is valid, otherwise continues without user
module.exports = (req, res, next) => {
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    console.error('JWT_SECRET not configured');
    return next(); // Continue without user
  }

  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return next(); // No token, continue as guest
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
  } catch {
    // Invalid token, continue as guest
  }

  next();
};

