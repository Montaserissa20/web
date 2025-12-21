// src/routes/stats.routes.js
const express = require('express');
const router = express.Router();
const StatsController = require('../controllers/stats.controller');
const authMiddleware = require('../middleware/auth.middleware');
const requireRole = require('../middleware/requireRole.middleware');

// Track a visit (public – can be called from frontend on each page load)
router.post('/visit', StatsController.trackVisit);

// Get site traffic stats (ideally admin-only)
router.get('/site-traffic', StatsController.getSiteTraffic);

// Get user dashboard stats (requires auth)
router.get('/dashboard', authMiddleware, StatsController.getUserDashboardStats);

// Get admin stats (requires admin role)
router.get('/admin', authMiddleware, requireRole('admin', 'moderator'), StatsController.getAdminStats);

module.exports = router;
