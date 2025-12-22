// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const { validateCSRFToken } = require('./middleware/csrf.middleware');

const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

// CORS configuration - use environment variables
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:8080', 'http://localhost:5173']; // fallback for development

const corsOptions = {
  origin: corsOrigins,
  credentials: true, // Enable credentials for CSRF cookies
};

app.use(cors(corsOptions));

// Cookie parser - required for CSRF token validation
app.use(cookieParser());

// JSON parsing
app.use(express.json());

// Static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// CSRF protection - skip for auth/csrf endpoint (token generation)
// Enable CSRF protection based on environment variable (default: enabled in production)
const csrfEnabled = process.env.CSRF_ENABLED !== 'false';
if (csrfEnabled) {
  app.use('/api', (req, res, next) => {
    // Skip CSRF for the token generation endpoint
    if (req.path === '/auth/csrf') {
      return next();
    }
    return validateCSRFToken(req, res, next);
  });
}

// mount all API routes under /api
app.use('/api', routes);

app.get('/', (_req, res) => {
  res.send('Backend OK');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CSRF protection: ${csrfEnabled ? 'enabled' : 'disabled'}`);
});
