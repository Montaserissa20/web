// src/routes/adminAnimals.routes.js
const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/requireRole.middleware');
const AdminAnimalsController = require('../controllers/adminAnimals.controller');

// All routes require authentication
router.use(auth);

// List all listings - admin and moderator can view
router.get('/', requireRole('admin', 'moderator'), AdminAnimalsController.listAll);

// Approve/Reject - admin and moderator can approve/reject
router.patch('/:id/approve', requireRole('admin', 'moderator'), AdminAnimalsController.approve);
router.patch('/:id/reject', requireRole('admin', 'moderator'), AdminAnimalsController.reject);

// Delete - only admin can delete
router.delete('/:id', requireRole('admin'), AdminAnimalsController.remove);

module.exports = router;
