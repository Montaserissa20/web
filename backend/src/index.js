// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

// CORS configuration - use environment variables
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:8080', 'http://localhost:5173']; // fallback for development

const corsOptions = {
  origin: corsOrigins,
  credentials: false,
};

app.use(cors(corsOptions));

// JSON parsing
app.use(express.json());

// Static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// mount all API routes under /api
app.use('/api', routes);

app.get('/', (_req, res) => {
  res.send('Backend OK');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
