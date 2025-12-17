// src/routes/adminUsers.routes.js
const express = require('express');
const router = express.Router();

const AdminUserController = require('../controllers/adminUser.controller');
const authMiddleware = require('../middleware/auth.middleware');      // you already have this
const requireRole = require('../middleware/requireRole.middleware'); // simple helper

// only logged-in admins can use these routes
router.use(authMiddleware, requireRole('admin'));

router.get('/', AdminUserController.listUsers);
router.patch('/:id/role', AdminUserController.updateRole);
router.patch('/:id/ban', AdminUserController.setBanStatus);

module.exports = router;
