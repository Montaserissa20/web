// src/models/message.model.js
const prisma = require('../config/prismaClient');

function mapMessage(msg) {
  if (!msg) return null;
  return {
    id: String(msg.id),
    conversationId: String(msg.conversation_id),
    senderId: String(msg.sender_id),
    content: msg.content,
    isRead: msg.is_read,
    createdAt: msg.created_at.toISOString(),
  };
}

function mapConversation(conv, currentUserId = null) {
  if (!conv) return null;
  
  // Determine who the "other" user is
  const otherUserId = Number(conv.user1_id) === Number(currentUserId) 
    ? conv.user2_id 
    : conv.user1_id;

  return {
    id: String(conv.id),
    user1Id: String(conv.user1_id),
    user2Id: String(conv.user2_id),
    animalId: conv.animal_id ? String(conv.animal_id) : null,
    otherUserId: String(otherUserId),
    createdAt: conv.created_at.toISOString(),
    updatedAt: conv.updated_at.toISOString(),
    messages: conv.messages ? conv.messages.map(mapMessage) : [],
    lastMessage: conv.messages?.length > 0 ? mapMessage(conv.messages[0]) : null,
  };
}

// Get or create a conversation between two users
exports.getOrCreateConversation = async (user1Id, user2Id, animalId = null) => {
  // Always order user IDs to ensure consistency
  const [smallerId, largerId] = [user1Id, user2Id].map(Number).sort((a, b) => a - b);
  
  // Try to find existing conversation
  let conversation = await prisma.conversations.findFirst({
    where: {
      user1_id: smallerId,
      user2_id: largerId,
      animal_id: animalId ? Number(animalId) : null,
    },
    include: {
      messages: {
        orderBy: { created_at: 'desc' },
        take: 1,
      },
    },
  });

  // Create if not exists
  if (!conversation) {
    conversation = await prisma.conversations.create({
      data: {
        user1_id: smallerId,
        user2_id: largerId,
        animal_id: animalId ? Number(animalId) : null,
      },
      include: {
        messages: true,
      },
    });
  }

  return mapConversation(conversation, user1Id);
};

// Get all conversations for a user
exports.getUserConversations = async (userId) => {
  const conversations = await prisma.conversations.findMany({
    where: {
      OR: [
        { user1_id: Number(userId) },
        { user2_id: Number(userId) },
      ],
    },
    include: {
      messages: {
        orderBy: { created_at: 'desc' },
        take: 1,
      },
    },
    orderBy: { updated_at: 'desc' },
  });

  return conversations.map(c => mapConversation(c, userId));
};

// Get conversation by ID
exports.getConversationById = async (conversationId, userId) => {
  const conversation = await prisma.conversations.findUnique({
    where: { id: Number(conversationId) },
    include: {
      messages: {
        orderBy: { created_at: 'asc' },
      },
    },
  });

  if (!conversation) return null;

  // Check if user is part of this conversation
  if (Number(conversation.user1_id) !== Number(userId) && 
      Number(conversation.user2_id) !== Number(userId)) {
    return null;
  }

  return mapConversation(conversation, userId);
};

// Send a message
exports.sendMessage = async (conversationId, senderId, content) => {
  const message = await prisma.messages.create({
    data: {
      conversation_id: Number(conversationId),
      sender_id: Number(senderId),
      content,
    },
  });

  // Update conversation's updated_at
  await prisma.conversations.update({
    where: { id: Number(conversationId) },
    data: { updated_at: new Date() },
  });

  return mapMessage(message);
};

// Get messages for a conversation
exports.getMessages = async (conversationId, limit = 50, beforeId = null) => {
  const where = { conversation_id: Number(conversationId) };
  if (beforeId) {
    where.id = { lt: Number(beforeId) };
  }

  const messages = await prisma.messages.findMany({
    where,
    orderBy: { created_at: 'desc' },
    take: limit,
  });

  return messages.map(mapMessage).reverse();
};

// Mark messages as read
exports.markAsRead = async (conversationId, userId) => {
  await prisma.messages.updateMany({
    where: {
      conversation_id: Number(conversationId),
      sender_id: { not: Number(userId) },
      is_read: false,
    },
    data: { is_read: true },
  });
};

// Get unread count for a user
exports.getUnreadCount = async (userId) => {
  // Get all conversations where user is participant
  const conversations = await prisma.conversations.findMany({
    where: {
      OR: [
        { user1_id: Number(userId) },
        { user2_id: Number(userId) },
      ],
    },
    select: { id: true },
  });

  const conversationIds = conversations.map(c => c.id);

  if (conversationIds.length === 0) return 0;

  const count = await prisma.messages.count({
    where: {
      conversation_id: { in: conversationIds },
      sender_id: { not: Number(userId) },
      is_read: false,
    },
  });

  return count;
};

