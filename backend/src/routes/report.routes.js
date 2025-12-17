// src/routes/report.routes.js
const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const optionalAuth = require('../middleware/optionalAuth.middleware');
const requireRole = require('../middleware/requireRole.middleware');
const ReportController = require('../controllers/report.controller');

// Create report - optional auth (guest can report too)
router.post('/', optionalAuth, ReportController.create);

// Get all reports - admin/moderator only
router.get('/', auth, requireRole('admin', 'moderator'), ReportController.getAll);

// Get report by ID - admin/moderator only
router.get('/:id', auth, requireRole('admin', 'moderator'), ReportController.getById);

// Update report status - admin/moderator only
router.patch('/:id/status', auth, requireRole('admin', 'moderator'), ReportController.updateStatus);

module.exports = router;

