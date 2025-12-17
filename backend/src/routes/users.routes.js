const express = require('express');
const UsersController = require('../controllers/users.controller');
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/requireRole.middleware');

const router = express.Router();

// current logged-in user
router.get('/me', auth, UsersController.getMe);

// admin: list all users
router.get('/', auth, requireRole('admin'), UsersController.getAllUsers);

// admin: change role
router.patch('/:id/role', auth, requireRole('admin'), UsersController.changeRole);

// admin: ban / unban
router.patch('/:id/ban', auth, requireRole('admin'), UsersController.banUser);
router.patch('/:id/unban', auth, requireRole('admin'), UsersController.unbanUser);
// PATCH /api/users/:id  (must be authenticated)
router.patch('/:id', auth, UsersController.updateProfile);
module.exports = router;
