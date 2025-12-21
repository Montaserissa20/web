const prisma = require('../config/prismaClient');

// Create a notification
exports.create = async ({ userId, type, title, message, link = null }) => {
  const notification = await prisma.notifications.create({
    data: {
      user_id: Number(userId),
      type,
      title,
      message,
      link,
    },
  });
  return toDTO(notification);
};

// Create notifications for multiple users (for announcements)
exports.createMany = async (notifications) => {
  const result = await prisma.notifications.createMany({
    data: notifications.map(n => ({
      user_id: Number(n.userId),
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link || null,
    })),
  });
  return result.count;
};

// Get all notifications for a user
exports.getByUserId = async (userId, { limit = 20, includeRead = false } = {}) => {
  const where = { user_id: Number(userId) };
  if (!includeRead) {
    where.is_read = false;
  }

  const notifications = await prisma.notifications.findMany({
    where,
    orderBy: { created_at: 'desc' },
    take: limit,
  });

  return notifications.map(toDTO);
};

// Get unread count for a user
exports.getUnreadCount = async (userId) => {
  const count = await prisma.notifications.count({
    where: {
      user_id: Number(userId),
      is_read: false,
    },
  });
  return count;
};

// Mark a notification as read
exports.markAsRead = async (id, userId) => {
  const notification = await prisma.notifications.updateMany({
    where: {
      id: parseInt(id),
      user_id: Number(userId),
    },
    data: { is_read: true },
  });
  return notification.count > 0;
};

// Mark all notifications as read for a user
exports.markAllAsRead = async (userId) => {
  const result = await prisma.notifications.updateMany({
    where: {
      user_id: Number(userId),
      is_read: false,
    },
    data: { is_read: true },
  });
  return result.count;
};

// Delete a notification
exports.delete = async (id, userId) => {
  const result = await prisma.notifications.deleteMany({
    where: {
      id: parseInt(id),
      user_id: Number(userId),
    },
  });
  return result.count > 0;
};

// Convert database record to frontend DTO
function toDTO(notification) {
  return {
    id: notification.id,
    userId: notification.user_id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    link: notification.link,
    isRead: notification.is_read,
    createdAt: notification.created_at,
  };
}

