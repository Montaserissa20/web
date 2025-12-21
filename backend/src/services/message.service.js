// src/services/message.service.js
const MessageModel = require('../models/message.model');
const prisma = require('../config/prismaClient');
const NotificationService = require('./notification.service');

// Start or get a conversation with another user
exports.startConversation = async (userId, otherUserId, animalId = null) => {
  if (Number(userId) === Number(otherUserId)) {
    throw new Error('Cannot start conversation with yourself');
  }

  // Verify other user exists
  const otherUser = await prisma.users.findUnique({
    where: { id: Number(otherUserId) },
  });

  if (!otherUser) {
    throw new Error('User not found');
  }

  return MessageModel.getOrCreateConversation(userId, otherUserId, animalId);
};

// Get user's conversations
exports.getUserConversations = async (userId) => {
  const conversations = await MessageModel.getUserConversations(userId);
  
  // Enrich with other user info
  const enriched = await Promise.all(
    conversations.map(async (conv) => {
      const otherUser = await prisma.users.findUnique({
        where: { id: Number(conv.otherUserId) },
        select: { id: true, name: true, avatar_url: true },
      });

      // Get animal info if exists
      let animal = null;
      if (conv.animalId) {
        animal = await prisma.animals.findUnique({
          where: { id: Number(conv.animalId) },
          select: { id: true, title: true, slug: true },
        });
      }

      return {
        ...conv,
        otherUser: otherUser ? {
          id: String(otherUser.id),
          name: otherUser.name,
          avatar: otherUser.avatar_url,
        } : null,
        animal: animal ? {
          id: String(animal.id),
          title: animal.title,
          slug: animal.slug,
        } : null,
      };
    })
  );

  return enriched;
};

// Get conversation by ID with messages
exports.getConversation = async (conversationId, userId) => {
  const conversation = await MessageModel.getConversationById(conversationId, userId);
  
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Mark messages as read
  await MessageModel.markAsRead(conversationId, userId);

  // Enrich with user info
  const otherUser = await prisma.users.findUnique({
    where: { id: Number(conversation.otherUserId) },
    select: { id: true, name: true, avatar_url: true },
  });

  let animal = null;
  if (conversation.animalId) {
    animal = await prisma.animals.findUnique({
      where: { id: Number(conversation.animalId) },
      select: { id: true, title: true, slug: true },
    });
  }

  return {
    ...conversation,
    otherUser: otherUser ? {
      id: String(otherUser.id),
      name: otherUser.name,
      avatar: otherUser.avatar_url,
    } : null,
    animal: animal ? {
      id: String(animal.id),
      title: animal.title,
      slug: animal.slug,
    } : null,
  };
};

// Send a message
exports.sendMessage = async (conversationId, senderId, content) => {
  if (!content || !content.trim()) {
    throw new Error('Message content is required');
  }

  // Verify sender is part of the conversation
  const conversation = await MessageModel.getConversationById(conversationId, senderId);
  if (!conversation) {
    throw new Error('Conversation not found or access denied');
  }

  const message = await MessageModel.sendMessage(conversationId, senderId, content.trim());

  // Send notification to the recipient
  try {
    const sender = await prisma.users.findUnique({
      where: { id: Number(senderId) },
      select: { name: true },
    });

    const recipientId = Number(conversation.otherUserId);
    if (recipientId) {
      await NotificationService.notifyNewMessage(
        recipientId,
        sender?.name || 'Someone',
        conversationId
      );
    }
  } catch (err) {
    console.error('Failed to send message notification:', err);
    // Don't fail the message send if notification fails
  }

  return message;
};

// Get more messages (pagination)
exports.getMessages = async (conversationId, userId, limit = 50, beforeId = null) => {
  // Verify user is part of the conversation
  const conversation = await MessageModel.getConversationById(conversationId, userId);
  if (!conversation) {
    throw new Error('Conversation not found or access denied');
  }

  return MessageModel.getMessages(conversationId, limit, beforeId);
};

// Get unread message count
exports.getUnreadCount = async (userId) => {
  return MessageModel.getUnreadCount(userId);
};

