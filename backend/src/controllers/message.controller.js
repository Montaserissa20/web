// src/controllers/message.controller.js
const MessageService = require('../services/message.service');

// POST /api/messages/conversations - Start or get a conversation
exports.startConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId, animalId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: 'Other user ID is required',
      });
    }

    const conversation = await MessageService.startConversation(userId, otherUserId, animalId);
    res.status(201).json({ success: true, data: conversation });
  } catch (err) {
    console.error('startConversation error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to start conversation' });
  }
};

// GET /api/messages/conversations - Get all conversations
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await MessageService.getUserConversations(userId);
    res.json({ success: true, data: conversations });
  } catch (err) {
    console.error('getConversations error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
};

// GET /api/messages/conversations/:id - Get conversation with messages
exports.getConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const conversation = await MessageService.getConversation(id, userId);
    res.json({ success: true, data: conversation });
  } catch (err) {
    console.error('getConversation error:', err);
    const status = err.message === 'Conversation not found' ? 404 : 400;
    res.status(status).json({ success: false, message: err.message || 'Failed to fetch conversation' });
  }
};

// POST /api/messages/conversations/:id/messages - Send a message
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      });
    }

    const message = await MessageService.sendMessage(id, userId, content);
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to send message' });
  }
};

// GET /api/messages/conversations/:id/messages - Get messages (with pagination)
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { limit = 50, beforeId } = req.query;

    const messages = await MessageService.getMessages(id, userId, Number(limit), beforeId);
    res.json({ success: true, data: messages });
  } catch (err) {
    console.error('getMessages error:', err);
    res.status(400).json({ success: false, message: err.message || 'Failed to fetch messages' });
  }
};

// GET /api/messages/unread - Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await MessageService.getUnreadCount(userId);
    res.json({ success: true, data: { count } });
  } catch (err) {
    console.error('getUnreadCount error:', err);
    res.status(500).json({ success: false, message: 'Failed to get unread count' });
  }
};

