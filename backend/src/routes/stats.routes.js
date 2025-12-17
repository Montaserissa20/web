// src/routes/stats.routes.js
const express = require('express');
const router = express.Router();
const StatsController = require('../controllers/stats.controller');
// const { authenticate, requireAdmin } = require('../middleware/auth'); // if you have these

// Track a visit (public – can be called from frontend on each page load)
router.post('/visit', StatsController.trackVisit);

// Get site traffic stats (ideally admin-only)
// router.get('/site-traffic', authenticate, requireAdmin, StatsController.getSiteTraffic);
router.get('/site-traffic', StatsController.getSiteTraffic);

module.exports = router;
