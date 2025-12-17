// src/routes/message.routes.js
const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const MessageController = require('../controllers/message.controller');

// All routes require authentication
router.use(auth);

// Get unread message count
router.get('/unread', MessageController.getUnreadCount);

// Start or get a conversation
router.post('/conversations', MessageController.startConversation);

// Get all conversations
router.get('/conversations', MessageController.getConversations);

// Get a specific conversation with messages
router.get('/conversations/:id', MessageController.getConversation);

// Send a message to a conversation
router.post('/conversations/:id/messages', MessageController.sendMessage);

// Get messages from a conversation (with pagination)
router.get('/conversations/:id/messages', MessageController.getMessages);

module.exports = router;

