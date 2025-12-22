/**
 * CSRF Protection Middleware
 * 
 * This implements double-submit cookie pattern for CSRF protection:
 * 1. Server generates a random token and sends it as a cookie
 * 2. Client must include the same token in a header (X-CSRF-Token)
 * 3. Server validates that cookie value matches header value
 * 
 * Since an attacker cannot read cookies from another domain (same-origin policy),
 * they cannot forge the header value.
 */

const crypto = require('crypto');

// Store for CSRF tokens (in production, use Redis or similar)
// Maps token -> { createdAt, userId }
const tokenStore = new Map();

// Token expiry time (1 hour)
const TOKEN_EXPIRY_MS = 60 * 60 * 1000;

// Clean up expired tokens every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of tokenStore.entries()) {
    if (now - data.createdAt > TOKEN_EXPIRY_MS) {
      tokenStore.delete(token);
    }
  }
}, 10 * 60 * 1000);

/**
 * Generate a new CSRF token
 */
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Middleware to generate and set CSRF token cookie
 * Call this on endpoints that need to provide a token (e.g., GET /api/auth/csrf)
 */
exports.setCSRFToken = (req, res, next) => {
  const token = generateToken();
  const userId = req.user?.id || 'anonymous';
  
  // Store the token
  tokenStore.set(token, {
    createdAt: Date.now(),
    userId,
  });

  // Set cookie with the token
  // httpOnly: false - so JavaScript can read it
  // sameSite: 'none' + secure needed for cross-origin in production
  // For development with different ports, we use 'lax' without secure
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false, // Must be readable by JS
    sameSite: isProduction ? 'none' : 'lax', // Cross-origin in production, lax for dev
    secure: isProduction, // Only secure in production (HTTPS)
    maxAge: TOKEN_EXPIRY_MS,
    path: '/',
  });

  // Also return the token in response for convenience
  req.csrfToken = token;
  next();
};

/**
 * Middleware to validate CSRF token
 * Checks that the token in the header matches the one in the cookie
 */
exports.validateCSRFToken = (req, res, next) => {
  // Skip CSRF check for safe methods (GET, HEAD, OPTIONS)
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Get token from header
  const headerToken = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];
  
  // Get token from cookie
  const cookieToken = req.cookies?.['XSRF-TOKEN'];

  // Validate tokens exist
  if (!headerToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token missing from header',
      code: 'CSRF_TOKEN_MISSING',
    });
  }

  if (!cookieToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF cookie missing',
      code: 'CSRF_COOKIE_MISSING',
    });
  }

  // Validate tokens match
  if (headerToken !== cookieToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token mismatch',
      code: 'CSRF_TOKEN_MISMATCH',
    });
  }

  // Check if token exists in store and is not expired
  const tokenData = tokenStore.get(headerToken);
  if (!tokenData) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token invalid or expired',
      code: 'CSRF_TOKEN_INVALID',
    });
  }

  // Check expiry
  if (Date.now() - tokenData.createdAt > TOKEN_EXPIRY_MS) {
    tokenStore.delete(headerToken);
    return res.status(403).json({
      success: false,
      message: 'CSRF token expired',
      code: 'CSRF_TOKEN_EXPIRED',
    });
  }

  next();
};

/**
 * Get current CSRF token from cookie (utility for routes)
 */
exports.getToken = (req) => {
  return req.cookies?.['XSRF-TOKEN'] || null;
};

