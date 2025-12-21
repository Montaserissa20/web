const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// Get notifications
router.get('/', NotificationController.getNotifications);

// Get unread count
router.get('/unread-count', NotificationController.getUnreadCount);

// Mark all as read
router.post('/mark-all-read', NotificationController.markAllAsRead);

// Mark specific notification as read
router.post('/:id/read', NotificationController.markAsRead);

// Delete notification
router.delete('/:id', NotificationController.deleteNotification);

module.exports = router;

